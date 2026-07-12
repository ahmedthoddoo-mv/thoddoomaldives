"use server";

import { redirect } from "next/navigation";
import {
  clearAdminDemoSession,
  createAdminDemoSession,
  isAdminDemoPasswordConfigured,
  isValidAdminDemoPassword
} from "@/lib/admin/adminAuth";

export type AdminLoginState = {
  error?: string;
};

export async function loginAdminDemo(_state: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  if (!isAdminDemoPasswordConfigured()) {
    return {
      error: "Admin demo password is not configured. Add ADMIN_DEMO_PASSWORD on the server."
    };
  }

  const password = String(formData.get("password") ?? "");

  if (!isValidAdminDemoPassword(password)) {
    return {
      error: "Incorrect password. Please try again."
    };
  }

  await createAdminDemoSession();
  redirect("/admin");
}

export async function logoutAdminDemo() {
  await clearAdminDemoSession();
  redirect("/admin");
}
