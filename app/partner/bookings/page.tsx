import type { Metadata } from "next";
import { PartnerBookingsView } from "@/components/partner-portal/PartnerBookingsView";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { getCurrentPartnerPortalData } from "@/lib/partner-portal/partnerAccess";
import { getLiveBookings } from "@/lib/repositories/liveReads";

export const metadata: Metadata = {
  title: "Partner Bookings"
};

export default async function PartnerBookingsPage() {
  const [bookingRead, portalData] = await Promise.all([getLiveBookings(), getCurrentPartnerPortalData()]);
  const selectedPartnerId = portalData.partnerId;

  return (
    <PartnerPortalShell portalData={portalData} title="Bookings" subtitle="View upcoming guests, pending requests, completed bookings, cancellations, and guest summaries.">
      <PartnerBookingsView
        initialBookings={portalData.bookings.length > 0 ? portalData.bookings : bookingRead.data.filter((booking) => booking.partnerId === selectedPartnerId)}
        selectedPartnerId={selectedPartnerId}
      />
    </PartnerPortalShell>
  );
}
