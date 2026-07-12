import type { Metadata } from "next";
import { PartnerBookingsView } from "@/components/partner-portal/PartnerBookingsView";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { getLiveBookings } from "@/lib/repositories/liveReads";

export const metadata: Metadata = {
  title: "Partner Bookings"
};

export default async function PartnerBookingsPage() {
  const bookingRead = await getLiveBookings();
  const selectedPartnerId = bookingRead.source === "supabase" ? "10000000-0000-0000-0000-000000000001" : "partner-thoddoo-sun-sky";

  return (
    <PartnerPortalShell title="Bookings" subtitle="View upcoming guests, pending requests, completed bookings, cancellations, and guest summaries.">
      <PartnerBookingsView
        initialBookings={bookingRead.data.filter((booking) => booking.partnerId === selectedPartnerId)}
        selectedPartnerId={selectedPartnerId}
      />
    </PartnerPortalShell>
  );
}
