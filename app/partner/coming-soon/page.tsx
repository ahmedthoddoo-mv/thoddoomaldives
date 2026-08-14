import type { Metadata } from "next";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { getCurrentPartnerPortalData } from "@/lib/partner-portal/partnerAccess";

export const metadata: Metadata = {
  title: "Partner Portal"
};

export default async function PartnerComingSoonPage() {
  const portalData = await getCurrentPartnerPortalData();

  return (
    <PartnerPortalShell portalData={portalData} title="Coming soon" subtitle="This section is being prepared for the next platform release.">
      <section className="partnerPortalPanel">
        <div className="partnerPortalSectionHeader">
          <p className="eyebrow">Coming soon</p>
          <h2>This feature is not live yet</h2>
        </div>
        <p>We are preparing this area for later billing, statements, and partner operations releases. No fake data or billing actions are exposed here.</p>
      </section>
    </PartnerPortalShell>
  );
}
