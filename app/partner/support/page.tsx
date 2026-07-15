import type { Metadata } from "next";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { PartnerSupportView } from "@/components/partner-portal/PartnerSupportView";
import { getCurrentPartnerPortalData } from "@/lib/partner-portal/partnerAccess";

export const metadata: Metadata = {
  title: "Partner Support"
};

export default async function PartnerSupportPage() {
  const portalData = await getCurrentPartnerPortalData();

  return (
    <PartnerPortalShell portalData={portalData} title="Support" subtitle="Contact the local team, open WhatsApp support, email support, and review common questions.">
      <PartnerSupportView />
    </PartnerPortalShell>
  );
}
