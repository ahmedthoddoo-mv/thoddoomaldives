import "server-only";

import { getAdminAuthState } from "@/lib/admin/adminAuth";
import { getAuthorizedPartnerScope } from "@/lib/partner-portal/partnerAccess";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { readBusinessMediaContext } from "@/lib/business-media/server";
import type { BusinessMediaType } from "@/types/business-media";

export async function authorizeBusinessMediaMutation(businessType: BusinessMediaType, businessId: string) {
  const db = createSupabaseServiceRoleClient();
  if (!db) {
    throw new Error("Supabase service role is not configured.");
  }

  const context = await readBusinessMediaContext(db, businessType, businessId);
  const adminState = await getAdminAuthState();
  if (adminState.status === "authenticated") {
    return { actor: "admin" as const, db, context, actorUserId: adminState.userId };
  }

  const partnerScope = await getAuthorizedPartnerScope();
  if (partnerScope.mode !== "supabase") {
    throw new Error("Partner authentication required.");
  }

  if (partnerScope.partnerId !== context.partnerId) {
    throw new Error("You can only manage media for your own business.");
  }

  if (partnerScope.listingId !== context.businessId || partnerScope.listingType !== context.businessType) {
    throw new Error("Partner business scope mismatch.");
  }

  return { actor: "partner" as const, db, context, actorUserId: partnerScope.authUserId };
}
