import type { Metadata } from "next";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { PartnerProfileEditor } from "@/components/partner-portal/PartnerProfileEditor";

export const metadata: Metadata = {
  title: "Partner Profile"
};

export default function PartnerProfilePage() {
  return (
    <PartnerPortalShell title="Business Profile" subtitle="Edit demo profile content, policies, contact channels, media paths, and languages.">
      <PartnerProfileEditor />
    </PartnerPortalShell>
  );
}
