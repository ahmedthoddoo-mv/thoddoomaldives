import type { Metadata } from "next";
import { PartnerAnalyticsView } from "@/components/partner-portal/PartnerAnalyticsView";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";

export const metadata: Metadata = {
  title: "Partner Analytics"
};

export default function PartnerAnalyticsPage() {
  return (
    <PartnerPortalShell title="Analytics" subtitle="Track page views, booking requests, WhatsApp clicks, countries, stay length, and revenue estimates.">
      <PartnerAnalyticsView />
    </PartnerPortalShell>
  );
}
