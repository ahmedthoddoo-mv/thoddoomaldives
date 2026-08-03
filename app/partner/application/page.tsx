import type { Metadata } from "next";
import { PartnerApplicationStatus } from "@/components/partner-portal/PartnerApplicationStatus";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { getCurrentPartnerPortalData } from "@/lib/partner-portal/partnerAccess";
import { getPartnerApplicationsForAdmin } from "@/lib/applications/partnerApplicationReads";

export const metadata: Metadata = {
  title: "Partner Application"
};

export default async function PartnerApplicationPage() {
  const portalData = await getCurrentPartnerPortalData();
  const applicationRead = await getPartnerApplicationsForAdmin();
  const application = applicationRead.applications.find((item) => item.linkedPartnerId === portalData.partnerId);

  return (
    <PartnerPortalShell
      portalData={portalData}
      title="Application Status"
      subtitle="Track review progress, admin feedback, requested changes, and linked listing status."
    >
      <PartnerApplicationStatus application={application} />
    </PartnerPortalShell>
  );
}
