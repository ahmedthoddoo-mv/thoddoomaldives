import type { Metadata } from "next";
import { PartnerGalleryManager } from "@/components/partner-portal/PartnerGalleryManager";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { getCurrentPartnerPortalData } from "@/lib/partner-portal/partnerAccess";

export const metadata: Metadata = {
  title: "Partner Gallery"
};

export default async function PartnerGalleryPage() {
  const portalData = await getCurrentPartnerPortalData();

  return (
    <PartnerPortalShell portalData={portalData} title="Gallery" subtitle="Manage logo, cover, hero, gallery, video placeholders, captions, alt text, ordering, and deletes.">
      <PartnerGalleryManager initialGallery={portalData.gallery} />
    </PartnerPortalShell>
  );
}
