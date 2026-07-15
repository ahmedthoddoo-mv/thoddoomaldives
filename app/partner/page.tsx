import type { Metadata } from "next";
import { PartnerDashboard } from "@/components/partner-portal/PartnerDashboard";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { getCurrentPartnerPortalData } from "@/lib/partner-portal/partnerAccess";

export const metadata: Metadata = {
  title: "Partner Portal"
};

export default async function PartnerPortalPage() {
  const portalData = await getCurrentPartnerPortalData();

  return (
    <PartnerPortalShell portalData={portalData} title="Partner Portal" subtitle="Self-service business dashboard for iThoddoo Maldives growth partners.">
      <PartnerDashboard
        initialPartnerBookings={portalData.bookings}
        membershipName={portalData.membership.plan}
        propertyName={portalData.profile.businessName}
        selectedPartnerId={portalData.partnerId}
      />
    </PartnerPortalShell>
  );
}
