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
  if (getDataMode() !== "supabase") {
    return { status: "mock" };
  }

  const supabase = createSupabaseServerClient();
  const serviceRole = createSupabaseServiceRoleClient();
  if (!supabase || !serviceRole) {
    return { status: "unconfigured", reason: "Supabase partner authentication is not configured." };
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(partnerAccessTokenCookie)?.value;
  if (!accessToken) {
    return { status: "unauthenticated", reason: "Partner session is missing." };
  }

  const { data: userResult, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !userResult.user) {
    return { status: "unauthenticated", reason: "Partner session is invalid or expired." };
  }

  const { data: partner } = await serviceRole
    .from("partners")
    .select("*")
    .eq("auth_user_id", userResult.user.id)
    .maybeSingle();

  return {
    status: "authenticated",
    userId: userResult.user.id,
    email: userResult.user.email ?? null,
    partner: (partner as Tables<"partners"> | null) ?? null
  };
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
    | "invitation_preview_created",
  metadata: Record<string, string | number | boolean | null> = {},
  partnerId?: string | null,
  authUserId?: string | null
) {
  if (getDataMode() !== "supabase") return;
  const serviceRole = createSupabaseServiceRoleClient();
  if (!serviceRole) return;

  await (serviceRole as any).from("partner_audit_events").insert({
    partner_id: partnerId ?? null,
    auth_user_id: authUserId ?? null,
    event_type: eventType,
    metadata
  });
}
