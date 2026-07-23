"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  clearAdminSessionCookies,
  getAdminAuthState,
  setAdminSessionCookies
} from "@/lib/admin/adminAuth";

export type AdminLoginState = {
  error?: string;
};

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function loginAdmin(_state: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const email = getFormString(formData, "email").toLowerCase();
  const password = getFormString(formData, "password");
  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return { error: "Owner authentication is not configured." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return { error: "Invalid owner login details." };
  }

  await setAdminSessionCookies(data.session.access_token, data.session.refresh_token, data.session.expires_in);
  const adminState = await getAdminAuthState();
  if (adminState.status !== "authenticated") {
    await clearAdminSessionCookies();
    return { error: "This account is not approved for the owner dashboard." };
  }

  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSessionCookies();
  redirect("/admin");
}
