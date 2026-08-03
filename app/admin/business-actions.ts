"use server";

import { requireAdminSession } from "@/lib/admin/adminAuth";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import { revalidatePublicListingPaths } from "@/lib/cache/publicRoutes";

export type AdminBusinessKind = "transfer" | "experience" | "restaurant";

export async function saveAdminBusinessListing(input: {
  kind: AdminBusinessKind;
  id?: string;
  values: Record<string, string | boolean | string[]>;
}) {
  const admin = await requireAdminSession();
  const db = createSupabaseServiceRoleClient();
  if (!db) return { ok: false, message: "Supabase service role is not configured." };
  const { data, error } = await db.rpc("admin_save_business_listing", {
    admin_user_id: admin.userId,
    listing_type: input.kind,
    listing_uuid: input.id ?? null,
    listing_payload: input.values as Json
  });
  if (error) return { ok: false, message: error.message };
  revalidatePublicListingPaths();
  return { ok: true, message: "Business listing saved.", data };
}
