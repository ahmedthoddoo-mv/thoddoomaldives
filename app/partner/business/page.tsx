import type { Metadata } from "next";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { PartnerProfileEditor } from "@/components/partner-portal/PartnerProfileEditor";
import { getCurrentPartnerPortalData } from "@/lib/partner-portal/partnerAccess";

export const metadata: Metadata = {
  title: "Partner My Business"
};

export default async function PartnerBusinessPage() {
  const portalData = await getCurrentPartnerPortalData();

  return (
    <PartnerPortalShell
      portalData={portalData}
      title="My Business"
      subtitle="Manage the business profile that powers public pages, bookings, SEO, and partner operations."
    >
      <PartnerProfileEditor initialProfile={portalData.profile} />
    </PartnerPortalShell>
  );
}
