import type { Metadata } from "next";
import { PartnerAgreementView } from "@/components/partner-portal/PartnerAgreementView";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { getCurrentPartnerPortalData } from "@/lib/partner-portal/partnerAccess";

export const metadata: Metadata = {
  title: "Partner Agreement"
};

export default async function PartnerAgreementPage() {
  const portalData = await getCurrentPartnerPortalData();

  return (
    <PartnerPortalShell portalData={portalData} title="Agreement" subtitle="View the current agreement status and future acceptance workflow foundation.">
      <PartnerAgreementView portalData={portalData} />
    </PartnerPortalShell>
  );
}
