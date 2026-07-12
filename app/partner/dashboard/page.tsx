import type { Metadata } from "next";
import { PartnerDashboard } from "@/components/partner-portal/PartnerDashboard";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { getLiveAdminProperties, getLiveBookings } from "@/lib/repositories/liveReads";

export const metadata: Metadata = {
  title: "Partner Dashboard"
};

export default async function PartnerDashboardPage() {
  const [bookingRead, propertyRead] = await Promise.all([getLiveBookings(), getLiveAdminProperties()]);
  const selectedPartnerId = bookingRead.source === "supabase" ? "10000000-0000-0000-0000-000000000001" : "partner-thoddoo-sun-sky";
  const selectedProperty = propertyRead.data.find((property) => property.slug === "thoddoo-sun-sky-inn");

  return (
    <PartnerPortalShell title="Business Dashboard" subtitle="Bookings, revenue, visibility, membership, and profile health at a glance.">
      <PartnerDashboard
        initialPartnerBookings={bookingRead.data.filter((booking) => booking.partnerId === selectedPartnerId)}
        initialPropertyRooms={selectedProperty?.roomTypes ?? []}
        membershipName={selectedProperty?.membershipPlan}
        propertyName={selectedProperty?.name}
        selectedPartnerId={selectedPartnerId}
      />
    </PartnerPortalShell>
  );
}
