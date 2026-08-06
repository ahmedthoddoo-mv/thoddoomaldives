import type { Metadata } from "next";
import { PartnerCalendarView } from "@/components/partner-portal/PartnerCalendarView";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { getCurrentPartnerPortalData } from "@/lib/partner-portal/partnerAccess";
import { getPartnerOperationsData } from "@/lib/partner-portal/partnerOperations";

export const metadata: Metadata = {
  title: "Partner Calendar"
};

export default async function PartnerCalendarPage() {
  const [portalData, operations] = await Promise.all([getCurrentPartnerPortalData(), getPartnerOperationsData()]);

  return (
    <PartnerPortalShell portalData={portalData} title="Calendar" subtitle="Monthly availability with occupied, blocked, pending, and open dates.">
      <PartnerCalendarView bookings={portalData.bookings} schedules={operations.schedules} availability={operations.availability} rooms={portalData.services} businessType={portalData.businessType} />
    </PartnerPortalShell>
  );
}
