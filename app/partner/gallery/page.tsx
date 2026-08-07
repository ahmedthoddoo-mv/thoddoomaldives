import type { Metadata } from "next";
import { PartnerGalleryManager } from "@/components/partner-portal/PartnerGalleryManager";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { getCurrentPartnerPortalData } from "@/lib/partner-portal/partnerAccess";
import { getBusinessTypeListingWorkflow } from "@/types/business-type";

export const metadata: Metadata = {
  title: "Partner Gallery"
};

export default async function PartnerGalleryPage() {
  const portalData = await getCurrentPartnerPortalData();
  const listingWorkflow = getBusinessTypeListingWorkflow(portalData.businessType);
  const mediaBusinessType =
    listingWorkflow === "property"
      ? "property"
      : listingWorkflow === "restaurant"
        ? "restaurant"
        : listingWorkflow === "experience"
          ? "experience"
          : "transfer";

  return (
    <PartnerPortalShell portalData={portalData} title="Gallery" subtitle="Manage logo, cover, hero, gallery, captions, alt text, and ordering.">
      <PartnerGalleryManager
        businessId={portalData.propertyId}
        businessName={portalData.profile.businessName}
        businessType={mediaBusinessType}
        initialGallery={portalData.gallery}
      />
    </PartnerPortalShell>
  );
}
