import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { renderAdminGateIfUnauthenticated } from "@/app/admin/adminPageGuard";
import { AdminPartnerOperationalView } from "@/components/admin/AdminPartnerOperationalView";
import { AdminShell } from "@/components/admin/AdminShell";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getPartnerOperationalStatus } from "@/lib/partner-platform/services";
import { getPartnerAuthState } from "@/lib/partner-portal/partnerAuth";

export const metadata: Metadata = {
  title: "Admin Partner Operations"
};

type AdminPartnerDetailPageProps = {
  params: Promise<{ partnerId: string }>;
};

export default async function AdminPartnerDetailPage({ params }: AdminPartnerDetailPageProps) {
  const gate = await renderAdminGateIfUnauthenticated();
  if (gate) return gate;

  const { partnerId } = await params;
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    notFound();
  }

  const [partnerResult, authState, operationalStatus] = await Promise.all([
    supabase.from("partners").select("*").eq("id", partnerId).maybeSingle(),
    getPartnerAuthState(),
    getPartnerOperationalStatus(partnerId)
  ]);

  if (partnerResult.error || !partnerResult.data) {
    notFound();
  }

  const partner = partnerResult.data;
  const { data: roleRows, error: roleError } = await supabase.from("partner_user_roles").select("auth_user_id, partner_id, role_id").eq("partner_id", partnerId).eq("active", true);
  if (roleError) {
    notFound();
  }

  const { data: roleDefinitions } = await supabase.from("partner_roles").select("id, code");
  const roleMap = new Map((roleDefinitions ?? []).map((role) => [role.id, role.code]));
  const roles = (roleRows ?? []).map((row) => ({
    authUserId: row.auth_user_id,
    partnerId: row.partner_id,
    roleCode: (roleMap.get(row.role_id) ?? "partner_staff") as "platform_owner" | "admin" | "finance" | "partner_owner" | "partner_staff"
  }));

  return (
    <AdminShell title="Partner Operational View" subtitle="View the latest read-only platform state for an individual partner.">
      <AdminPartnerOperationalView
        partnerName={partner.business_name ?? partner.id}
        legacyStatus={partner.status ?? "unknown"}
        partnerId={partner.id}
        operationalStatus={operationalStatus}
        roles={roles}
        authUserId={authState.status === "authenticated" ? authState.userId : null}
      />
    </AdminShell>
  );
}
