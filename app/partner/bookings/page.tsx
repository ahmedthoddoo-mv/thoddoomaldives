import type { Metadata } from "next";
import { PartnerBookingsView } from "@/components/partner-portal/PartnerBookingsView";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";

export const metadata: Metadata = {
  title: "Partner Bookings"
};

export default function PartnerBookingsPage() {
  return (
    <PartnerPortalShell title="Bookings" subtitle="View upcoming guests, pending requests, completed bookings, cancellations, and guest summaries.">
      <PartnerBookingsView />
    </PartnerPortalShell>
  );
}
