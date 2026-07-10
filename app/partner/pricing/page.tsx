import type { Metadata } from "next";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { PartnerPricingView } from "@/components/partner-portal/PartnerPricingView";

export const metadata: Metadata = {
  title: "Partner Pricing"
};

export default function PartnerPricingPage() {
  return (
    <PartnerPortalShell title="Membership" subtitle="Compare Free, Verified, Premium, and Enterprise partner plan capabilities.">
      <PartnerPricingView />
    </PartnerPortalShell>
  );
}
