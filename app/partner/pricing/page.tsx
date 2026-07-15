import type { Metadata } from "next";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { PartnerRoomsView } from "@/components/partner-portal/PartnerRoomsView";
import { getCurrentPartnerPortalData } from "@/lib/partner-portal/partnerAccess";

export const metadata: Metadata = {
  title: "Partner Pricing"
};

export default async function PartnerPricingPage() {
  const portalData = await getCurrentPartnerPortalData();

  return (
    <PartnerPortalShell portalData={portalData} title="Pricing Manager" subtitle="Add, edit, delete, reorder, duplicate, and activate prices for rooms and services.">
      <PartnerRoomsView initialServices={portalData.services} businessType={portalData.businessType} />
    </PartnerPortalShell>
  );
}
