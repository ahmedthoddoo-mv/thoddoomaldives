import type { Metadata } from "next";
import { PartnerNotificationsCenter } from "@/components/partner-portal/PartnerNotificationsCenter";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { getCurrentPartnerPortalData } from "@/lib/partner-portal/partnerAccess";

export const metadata: Metadata = {
  title: "Partner Notifications"
};

export default async function PartnerNotificationsPage() {
  const portalData = await getCurrentPartnerPortalData();

  return (
    <PartnerPortalShell portalData={portalData} title="Notifications" subtitle="Application approvals, changes requested, bookings, invoices, and membership reminders.">
      <PartnerNotificationsCenter notifications={portalData.notifications} />
    </PartnerPortalShell>
  );
}
