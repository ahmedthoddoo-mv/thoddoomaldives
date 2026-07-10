import type { Metadata } from "next";
import { PartnerDashboard } from "@/components/partner-portal/PartnerDashboard";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";

export const metadata: Metadata = {
  title: "Partner Portal"
};

export default function PartnerPortalPage() {
  return (
    <PartnerPortalShell title="Partner Portal" subtitle="Demo business dashboard for iThoddoo Maldives growth partners.">
      <PartnerDashboard />
    </PartnerPortalShell>
  );
}
