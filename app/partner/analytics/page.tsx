import type { Metadata } from "next";
import { PartnerAnalyticsView } from "@/components/partner-portal/PartnerAnalyticsView";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { getCurrentPartnerPortalData } from "@/lib/partner-portal/partnerAccess";

export const metadata: Metadata = {
  title: "Partner Analytics"
};

export default async function PartnerAnalyticsPage() {
  const portalData = await getCurrentPartnerPortalData();

  return (
    <PartnerPortalShell portalData={portalData} title="Analytics" subtitle="Track page views, booking requests, WhatsApp clicks, countries, stay length, and revenue estimates.">
      <PartnerAnalyticsView />
    </PartnerPortalShell>
  );
}
