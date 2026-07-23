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
  const supabase = createSupabaseServerClient();
  const serviceRole = createSupabaseServiceRoleClient();
  if (!supabase || !serviceRole) {
    return { status: "unconfigured", reason: "Supabase owner authentication is not configured." };
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(adminAccessTokenCookie)?.value;
  if (!accessToken) {
    return { status: "unauthenticated", reason: "Owner session is missing." };
  }

  const { data: userResult, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !userResult.user?.email) {
    return { status: "unauthenticated", reason: "Owner session is invalid or expired." };
  }

  const { data: adminUser, error: adminError } = await serviceRole
    .from("admin_users")
    .select("role, is_active")
    .eq("auth_user_id", userResult.user.id)
    .eq("is_active", true)
    .maybeSingle();
  const adminRecord = adminUser as Tables<"admin_users"> | null;

  if (adminError || !adminRecord || !["owner", "admin"].includes(adminRecord.role)) {
    return { status: "unauthenticated", reason: "This account does not have dashboard access." };
  }

  return {
    status: "authenticated",
    userId: userResult.user.id,
    email: userResult.user.email,
    role: adminRecord.role
  };
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
