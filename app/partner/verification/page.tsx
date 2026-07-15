import type { Metadata } from "next";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { PartnerVerificationView } from "@/components/partner-portal/PartnerVerificationView";
import { getCurrentPartnerPortalData } from "@/lib/partner-portal/partnerAccess";

export const metadata: Metadata = {
  title: "Partner Verification"
};

export default async function PartnerVerificationPage() {
  const portalData = await getCurrentPartnerPortalData();

  return (
    <PartnerPortalShell portalData={portalData} title="Verification" subtitle="Track verification percentage, missing documents, missing information, admin notes, and requested changes.">
      <PartnerVerificationView portalData={portalData} />
    </PartnerPortalShell>
  );
}
