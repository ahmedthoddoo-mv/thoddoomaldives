"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDataMode } from "@/lib/supabase/status";
import {
  clearPartnerSessionCookies,
  getPartnerAuthState,
  logPartnerAuditEvent,
  setPartnerSessionCookies
} from "@/lib/partner-portal/partnerAuth";

export type PartnerAuthFormState = {
  ok: boolean;
  message: string;
};

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getPartnerRedirectPath(formData: FormData) {
  const next = getFormString(formData, "next");
  return next.startsWith("/partner") && !next.startsWith("/partner/login") ? next : "/partner/dashboard";
}

export async function signInPartner(_prevState: PartnerAuthFormState, formData: FormData): Promise<PartnerAuthFormState> {
  if (getDataMode() !== "supabase") {
    return { ok: false, message: "Partner login is only required in Supabase mode." };
  }

  const email = getFormString(formData, "email").toLowerCase();
  const password = getFormString(formData, "password");
  if (!email || !password) {
    return { ok: false, message: "Email and password are required." };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, message: "Supabase authentication is not configured." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) {
    return { ok: false, message: "Invalid partner login details." };
  }

  await setPartnerSessionCookies(data.session.access_token, data.session.refresh_token, data.session.expires_in);
  await logPartnerAuditEvent("login", { email }, null, data.user.id);
  redirect(getPartnerRedirectPath(formData));
}

export async function signOutPartner() {
  const authState = await getPartnerAuthState();
  if (authState.status === "authenticated") {
    await logPartnerAuditEvent("logout", {}, authState.partner?.id ?? null, authState.userId);
  }
  await clearPartnerSessionCookies();
  redirect("/partner/login");
}

export async function requestPartnerPasswordReset(
  _prevState: PartnerAuthFormState,
  formData: FormData
): Promise<PartnerAuthFormState> {
  if (getDataMode() !== "supabase") {
    return { ok: false, message: "Password reset is only available in Supabase mode." };
  }

  const email = getFormString(formData, "email").toLowerCase();
  if (!email) {
    return { ok: false, message: "Email is required." };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, message: "Supabase authentication is not configured." };
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/partner/reset-password`
  });
  await logPartnerAuditEvent("password_reset_requested", { email });

  if (error) {
    return { ok: false, message: "Password reset could not be requested." };
  }

  return { ok: true, message: "Password reset email requested. Check the partner inbox." };
}

export async function resetPartnerPassword(_prevState: PartnerAuthFormState, formData: FormData): Promise<PartnerAuthFormState> {
  if (getDataMode() !== "supabase") {
    return { ok: false, message: "Password reset is only available in Supabase mode." };
  }

  const accessToken = getFormString(formData, "access_token");
  const refreshToken = getFormString(formData, "refresh_token");
  const password = getFormString(formData, "password");
  const confirmPassword = getFormString(formData, "confirm_password");
  if (!accessToken || !refreshToken) {
    return { ok: false, message: "Reset session is missing. Open the latest reset email link." };
  }
  if (password.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { ok: false, message: "Passwords do not match." };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, message: "Supabase authentication is not configured." };
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken
  });
  if (sessionError || !sessionData.session) {
    return { ok: false, message: "Reset session is invalid or expired." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { ok: false, message: "Password could not be updated." };
  }

  await setPartnerSessionCookies(
    sessionData.session.access_token,
    sessionData.session.refresh_token,
    sessionData.session.expires_in
  );

  return { ok: true, message: "Password updated. You can continue to the partner dashboard." };
}
