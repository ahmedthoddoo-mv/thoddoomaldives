import type { Metadata } from "next";
import { PartnerDashboard } from "@/components/partner-portal/PartnerDashboard";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";

export const metadata: Metadata = {
  title: "Partner Dashboard"
};

export default function PartnerDashboardPage() {
  return (
    <PartnerPortalShell title="Business Dashboard" subtitle="Bookings, revenue, visibility, membership, and profile health at a glance.">
      <PartnerDashboard />
    </PartnerPortalShell>
  );
}
