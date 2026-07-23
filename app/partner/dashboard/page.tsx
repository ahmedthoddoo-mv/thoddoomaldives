import type { Metadata } from "next";
import { PartnerDashboard } from "@/components/partner-portal/PartnerDashboard";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { getCurrentPartnerPortalData } from "@/lib/partner-portal/partnerAccess";

export const metadata: Metadata = {
  title: "Partner Dashboard"
};

export default async function PartnerDashboardPage() {
  const portalData = await getCurrentPartnerPortalData();
  const selectedPartnerId = portalData.partnerId;

  return (
    <PartnerPortalShell portalData={portalData} title="Business Dashboard" subtitle="Bookings, revenue, visibility, membership, and profile health at a glance.">
      <PartnerDashboard
        initialPartnerBookings={portalData.bookings}
        initialPropertyRooms={portalData.services.map((service) => ({
          id: service.id,
          name: service.title,
          capacity: service.metadata.capacity ?? "",
          price: service.price,
          availability: service.active ? "Available" : "Blocked",
          seasonalPrice: service.notes,
          discount: "",
          amenities: service.description ? service.description.split(",").map((item) => item.trim()).filter(Boolean) : []
        }))}
        membershipName={portalData.membership.plan}
        propertyName={portalData.profile.businessName}
        selectedPartnerId={selectedPartnerId}
      />
    </PartnerPortalShell>
  );
}
