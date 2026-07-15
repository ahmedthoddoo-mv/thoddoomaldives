import type { Metadata } from "next";
import { PartnerDashboard } from "@/components/partner-portal/PartnerDashboard";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { getCurrentPartnerPortalData } from "@/lib/partner-portal/partnerAccess";
import { getLiveAdminProperties, getLiveBookings } from "@/lib/repositories/liveReads";

export const metadata: Metadata = {
  title: "Partner Dashboard"
};

export default async function PartnerDashboardPage() {
  const [bookingRead, propertyRead, portalData] = await Promise.all([getLiveBookings(), getLiveAdminProperties(), getCurrentPartnerPortalData()]);
  const selectedPartnerId = portalData.partnerId;
  const selectedProperty = propertyRead.data.find((property) => property.slug === "thoddoo-sun-sky-inn");

  return (
    <PartnerPortalShell portalData={portalData} title="Business Dashboard" subtitle="Bookings, revenue, visibility, membership, and profile health at a glance.">
      <PartnerDashboard
        initialPartnerBookings={portalData.bookings.length > 0 ? portalData.bookings : bookingRead.data.filter((booking) => booking.partnerId === selectedPartnerId)}
        initialPropertyRooms={selectedProperty?.roomTypes ?? []}
        membershipName={portalData.membership.plan}
        propertyName={portalData.profile.businessName}
        selectedPartnerId={selectedPartnerId}
      />
    </PartnerPortalShell>
  );
}
