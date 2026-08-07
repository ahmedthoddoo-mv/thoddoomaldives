import "server-only";

import { cookies } from "next/headers";
import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getDataMode } from "@/lib/supabase/status";
import type { Tables } from "@/lib/supabase/types";

export const partnerAccessTokenCookie = "ithoddoo_partner_access_token";
export const partnerRefreshTokenCookie = "ithoddoo_partner_refresh_token";

export type PartnerAuthState =
  | { status: "mock" }
  | { status: "unauthenticated"; reason: string }
  | { status: "unconfigured"; reason: string }
  | {
      status: "authenticated";
      userId: string;
      email: string | null;
      partner: Tables<"partners"> | null;
    };

const secureCookie = process.env.NODE_ENV === "production";

function getSafeMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (!message) return undefined;
  if (/(token|secret|password|cookie|authorization|bearer|jwt|key)/i.test(message)) return undefined;
  return message.slice(0, 200);
}

function getSafeErrorMeta(error: unknown) {
  const details = error && typeof error === "object" ? error as { name?: unknown; code?: unknown; status?: unknown } : {};
  return {
    name: typeof details.name === "string" ? details.name : error instanceof Error ? error.name : "UnknownError",
    code: typeof details.code === "string" || typeof details.code === "number" ? String(details.code) : undefined,
    status: typeof details.status === "number" || typeof details.status === "string" ? String(details.status) : undefined,
    message: getSafeMessage(error)
  };
}

export function getPartnerCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: secureCookie,
    sameSite: "lax" as const,
    path: "/partner",
    maxAge
  };
}

export async function setPartnerSessionCookies(accessToken: string, refreshToken: string, expiresIn: number) {
  const cookieStore = await cookies();
  cookieStore.set(partnerAccessTokenCookie, accessToken, getPartnerCookieOptions(Math.max(60, expiresIn)));
  cookieStore.set(partnerRefreshTokenCookie, refreshToken, getPartnerCookieOptions(60 * 60 * 24 * 30));
}

export async function clearPartnerSessionCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(partnerAccessTokenCookie);
  cookieStore.delete(partnerRefreshTokenCookie);
}

export async function getPartnerAuthState(): Promise<PartnerAuthState> {
  console.info("[prod-auth-debug] partner-auth:start");
  if (getDataMode() !== "supabase") {
    console.info("[prod-auth-debug] partner-auth:data-mode:mock");
    return { status: "mock" };
  }

  try {
    console.info("[prod-auth-debug] partner-auth:create-client");
    const supabase = createSupabaseServerClient();
    const serviceRole = createSupabaseServiceRoleClient();
    if (!supabase || !serviceRole) {
      console.warn("[prod-auth-debug] partner-auth:create-client:missing");
      return { status: "unconfigured", reason: "Supabase partner authentication is not configured." };
    }

    console.info("[prod-auth-debug] partner-auth:cookies:start");
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(partnerAccessTokenCookie)?.value;
    if (!accessToken) {
      console.info("[prod-auth-debug] partner-auth:cookies:missing-token");
      return { status: "unauthenticated", reason: "Partner session is missing." };
    }
    console.info("[prod-auth-debug] partner-auth:cookies:token-present");

    console.info("[prod-auth-debug] partner-auth:get-user:start");
    const { data: userResult, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !userResult.user) {
      console.warn("[prod-auth-debug] partner-auth:get-user:failed", {
        code: userError?.code,
        status: userError?.status,
        message: getSafeMessage(userError)
      });
      return { status: "unauthenticated", reason: "Partner session is invalid or expired." };
    }
    console.info("[prod-auth-debug] partner-auth:get-user:success");

    console.info("[prod-auth-debug] partner-auth:lookup-partner:start");
    const { data: partner, error: partnerError } = await serviceRole
      .from("partners")
      .select("*")
      .eq("auth_user_id", userResult.user.id)
      .maybeSingle();
    if (partnerError) {
      console.error("[prod-auth-debug] partner-auth:lookup-partner:failed", {
        code: partnerError.code,
        message: getSafeMessage(partnerError)
      });
      throw new Error(`Partner account lookup failed: ${partnerError.message}`);
    }
    console.info("[prod-auth-debug] partner-auth:lookup-partner:success");

    return {
      status: "authenticated",
      userId: userResult.user.id,
      email: userResult.user.email ?? null,
      partner: (partner as Tables<"partners"> | null) ?? null
    };
  } catch (error) {
    console.error("[prod-auth-debug] partner-auth:threw", getSafeErrorMeta(error));
    throw error;
  }
}

export async function logPartnerAuditEvent(
  eventType:
    | "login"
    | "logout"
    | "password_reset_requested"
    | "profile_update"
    | "document_update"
    | "price_update"
    | "property_update"
    | "gallery_update"
    | "booking_update"
    | "notification_update"
    | "transfer_schedule_update"
    | "availability_update"
    | "availability_provider_update"
    | "invitation_preview_created",
  metadata: Record<string, string | number | boolean | null> = {},
  partnerId?: string | null,
  authUserId?: string | null
) {
  if (getDataMode() !== "supabase") return;
  const serviceRole = createSupabaseServiceRoleClient();
  if (!serviceRole) return;

  await serviceRole.from("partner_audit_events").insert({
    partner_id: partnerId ?? null,
    auth_user_id: authUserId ?? null,
    event_type: eventType,
    metadata
  });
}
