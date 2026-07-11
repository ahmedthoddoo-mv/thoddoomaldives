import type { Metadata } from "next";
import { PartnerApplicationStatus } from "@/components/partner-portal/PartnerApplicationStatus";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";

export const metadata: Metadata = {
  title: "Partner Application"
};

export default function PartnerApplicationPage() {
  return (
    <PartnerPortalShell
      title="Application Status"
      subtitle="Track review progress, admin feedback, requested changes, and linked listing status."
    >
      <PartnerApplicationStatus />
    </PartnerPortalShell>
  );
}
