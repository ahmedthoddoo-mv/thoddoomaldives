import MediaGallery from "@/components/media/MediaGallery";
import type { PartnerPortalGalleryItem } from "@/lib/partner-portal/partnerAccess";
import type { BusinessMediaType } from "@/types/business-media";

export function PartnerGalleryManager({
  businessId,
  businessName,
  businessType,
  initialGallery = []
}: {
  businessId: string;
  businessName: string;
  businessType: BusinessMediaType;
  initialGallery?: PartnerPortalGalleryItem[];
}) {
  return (
    <MediaGallery
      mode="manage"
      businessId={businessId}
      businessName={businessName}
      businessType={businessType}
      items={initialGallery}
      title="Partner gallery manager"
      description="Upload multiple photos, reorder them, choose the cover and featured image, and keep captions in sync across the site."
      emptyTitle="No business media yet"
      emptyDescription="Upload your first approved business images. They will stay hidden publicly until you keep them marked public."
    />
  );
}
