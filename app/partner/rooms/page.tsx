import type { Metadata } from "next";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { PartnerRoomsView } from "@/components/partner-portal/PartnerRoomsView";
import { getCurrentPartnerPortalData } from "@/lib/partner-portal/partnerAccess";

export const metadata: Metadata = {
  title: "Partner Rooms"
};

export default async function PartnerRoomsPage() {
  const portalData = await getCurrentPartnerPortalData();

  return (
    <PartnerPortalShell portalData={portalData} title="Rooms / Services" subtitle="Manage rooms, services, capacity, amenities, equipment, safety information, availability, and prices.">
      <PartnerRoomsView initialServices={portalData.services} businessType={portalData.businessType} />
    </PartnerPortalShell>
  );
}
