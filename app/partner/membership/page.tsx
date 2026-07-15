import type { Metadata } from "next";
import { PartnerMembershipView } from "@/components/partner-portal/PartnerMembershipView";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { getCurrentPartnerPortalData } from "@/lib/partner-portal/partnerAccess";

export const metadata: Metadata = {
  title: "Partner Membership"
};

export default async function PartnerMembershipPage() {
  const portalData = await getCurrentPartnerPortalData();

  return (
    <PartnerPortalShell portalData={portalData} title="Membership" subtitle="View current plan, renewal status, invoice placeholders, and upgrade options.">
      <PartnerMembershipView portalData={portalData} />
    </PartnerPortalShell>
  );
}
