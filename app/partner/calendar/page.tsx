import type { Metadata } from "next";
import { PartnerCalendarView } from "@/components/partner-portal/PartnerCalendarView";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { getCurrentPartnerPortalData } from "@/lib/partner-portal/partnerAccess";

export const metadata: Metadata = {
  title: "Partner Calendar"
};

export default async function PartnerCalendarPage() {
  const portalData = await getCurrentPartnerPortalData();

  return (
    <PartnerPortalShell portalData={portalData} title="Calendar" subtitle="Monthly availability with occupied, blocked, pending, and open dates.">
      <PartnerCalendarView />
    </PartnerPortalShell>
  );
}
