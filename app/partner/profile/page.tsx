import type { Metadata } from "next";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { PartnerProfileEditor } from "@/components/partner-portal/PartnerProfileEditor";
import { getCurrentPartnerPortalData } from "@/lib/partner-portal/partnerAccess";

export const metadata: Metadata = {
  title: "Partner Profile"
};

export default async function PartnerProfilePage() {
  const portalData = await getCurrentPartnerPortalData();

  return (
    <PartnerPortalShell portalData={portalData} title="Business Profile" subtitle="Edit profile content, policies, contact channels, SEO, operating hours, and languages.">
      <PartnerProfileEditor initialProfile={portalData.profile} />
    </PartnerPortalShell>
  );
}
