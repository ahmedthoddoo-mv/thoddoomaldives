import type { Metadata } from "next";
import { PartnerDocumentCenter } from "@/components/partner-portal/PartnerDocumentCenter";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { getCurrentPartnerPortalData } from "@/lib/partner-portal/partnerAccess";

export const metadata: Metadata = {
  title: "Partner Documents"
};

export default async function PartnerDocumentsPage() {
  const portalData = await getCurrentPartnerPortalData();

  return (
    <PartnerPortalShell portalData={portalData} title="Documents" subtitle="Manage business registration, tourism license, GST, Green Tax, insurance, Owner ID, and other private documents.">
      <PartnerDocumentCenter initialDocuments={portalData.documents} />
    </PartnerPortalShell>
  );
}
