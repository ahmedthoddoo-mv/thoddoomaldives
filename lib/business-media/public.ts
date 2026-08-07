import type { BusinessMediaItem, BusinessMediaType } from "@/types/business-media";

export function mediaItemsFromUrls(
  urls: string[],
  businessName: string,
  businessType: BusinessMediaType = "property",
  businessId = "public"
): BusinessMediaItem[] {
  return urls.filter(Boolean).map((url, index) => ({
    id: `public-${businessType}-${businessId}-${index}-${url}`,
    businessType,
    businessId,
    mediaAssetId: `public-asset-${businessType}-${businessId}-${index}`,
    url,
    fileName: url.split("/").filter(Boolean).at(-1) ?? `gallery-${index + 1}.jpg`,
    mimeType: "image/jpeg",
    width: null,
    height: null,
    storageBucket: null,
    storagePath: null,
    caption: `${businessName} photo ${index + 1}`,
    altText: businessName,
    sortOrder: index,
    isCover: index === 0,
    isFeatured: false,
    isPublic: true,
    mediaPurpose: "gallery" as const,
    source: "legacy"
  }));
}
