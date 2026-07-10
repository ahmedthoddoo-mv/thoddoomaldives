import type { Metadata } from "next";
import { PartnerCalendarView } from "@/components/partner-portal/PartnerCalendarView";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";

export const metadata: Metadata = {
  title: "Partner Calendar"
};

export default function PartnerCalendarPage() {
  return (
    <PartnerPortalShell title="Calendar" subtitle="Demo monthly availability with occupied, blocked, pending, and open dates.">
      <PartnerCalendarView />
    </PartnerPortalShell>
  );
}
