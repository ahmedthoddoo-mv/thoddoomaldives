import type { Metadata } from "next";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { PartnerRoomsView } from "@/components/partner-portal/PartnerRoomsView";

export const metadata: Metadata = {
  title: "Partner Rooms"
};

export default function PartnerRoomsPage() {
  return (
    <PartnerPortalShell title="Room Management" subtitle="Manage rooms, prices, capacity, amenities, photos, availability, seasonal pricing, and discounts.">
      <PartnerRoomsView />
    </PartnerPortalShell>
  );
}
