import "server-only";

import { cookies } from "next/headers";
import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export const adminAccessTokenCookie = "ithoddoo_admin_access_token";
export const adminRefreshTokenCookie = "ithoddoo_admin_refresh_token";

export type AdminAuthState =
  | { status: "authenticated"; userId: string; email: string; role: "owner" | "admin" }
  | { status: "unauthenticated"; reason: string }
  | { status: "unconfigured"; reason: string };

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

function getAdminCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: secureCookie,
    sameSite: "lax" as const,
    path: "/",
    maxAge
  };
}

export async function setAdminSessionCookies(accessToken: string, refreshToken: string, expiresIn: number) {
  const cookieStore = await cookies();
  cookieStore.set(adminAccessTokenCookie, accessToken, getAdminCookieOptions(Math.max(60, expiresIn)));
  cookieStore.set(adminRefreshTokenCookie, refreshToken, getAdminCookieOptions(60 * 60 * 24 * 30));
}

export async function clearAdminSessionCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(adminAccessTokenCookie);
  cookieStore.delete(adminRefreshTokenCookie);
}

export async function getAdminAuthState(): Promise<AdminAuthState> {
  console.info("[prod-auth-debug] admin:start");
  try {
    console.info("[prod-auth-debug] admin:create-client");
    const supabase = createSupabaseServerClient();
    const serviceRole = createSupabaseServiceRoleClient();
    if (!supabase || !serviceRole) {
      console.warn("[prod-auth-debug] admin:create-client:missing");
      return { status: "unconfigured", reason: "Supabase owner authentication is not configured." };
    }

    console.info("[prod-auth-debug] admin:cookies:start");
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(adminAccessTokenCookie)?.value;
    if (!accessToken) {
      console.info("[prod-auth-debug] admin:cookies:missing-token");
      return { status: "unauthenticated", reason: "Owner session is missing." };
    }
    console.info("[prod-auth-debug] admin:cookies:token-present");

    console.info("[prod-auth-debug] admin:get-user:start");
    const { data: userResult, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !userResult.user?.email) {
      console.warn("[prod-auth-debug] admin:get-user:failed", {
        code: userError?.code,
        status: userError?.status,
        message: getSafeMessage(userError)
      });
      return { status: "unauthenticated", reason: "Owner session is invalid or expired." };
    }
    console.info("[prod-auth-debug] admin:get-user:success");

    console.info("[prod-auth-debug] admin:lookup-admin-user:start");
    const { data: adminUser, error: adminError } = await serviceRole
      .from("admin_users")
      .select("role, is_active")
      .eq("auth_user_id", userResult.user.id)
      .eq("is_active", true)
      .maybeSingle();
    const adminRecord = adminUser as Tables<"admin_users"> | null;

    if (adminError || !adminRecord || !["owner", "admin"].includes(adminRecord.role)) {
      console.warn("[prod-auth-debug] admin:lookup-admin-user:failed", {
        code: adminError?.code,
        message: getSafeMessage(adminError),
        hasRecord: Boolean(adminRecord)
      });
      return { status: "unauthenticated", reason: "This account does not have dashboard access." };
    }
    console.info("[prod-auth-debug] admin:lookup-admin-user:success");
    console.info("[prod-auth-debug] admin:authenticated");

    return {
      status: "authenticated",
      userId: userResult.user.id,
      email: userResult.user.email,
      role: adminRecord.role
    };
  } catch (error) {
    console.error("[prod-auth-debug] admin:threw", getSafeErrorMeta(error));
    throw error;
  }
}

export async function hasAdminSession() {
  return (await getAdminAuthState()).status === "authenticated";
}

export async function requireAdminSession() {
  const state = await getAdminAuthState();
  if (state.status !== "authenticated") {
    throw new Error("Owner authentication required.");
  }
  return state;
}
