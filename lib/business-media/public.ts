import type { BusinessMediaItem, BusinessMediaType } from "@/types/business-media";

function comparePublicMediaPriority(left: BusinessMediaItem, right: BusinessMediaItem) {
  if (left.isCover !== right.isCover) {
    return left.isCover ? -1 : 1;
  }
  if (left.isFeatured !== right.isFeatured) {
    return left.isFeatured ? -1 : 1;
  }
  if (left.sortOrder !== right.sortOrder) {
    return left.sortOrder - right.sortOrder;
  }
  return left.fileName.localeCompare(right.fileName);
}

export function orderPublicBusinessMedia(items: BusinessMediaItem[]) {
  return items
    .filter((item) => item.isPublic)
    .slice()
    .sort(comparePublicMediaPriority);
}

export function getCanonicalPublicMediaCover(items: BusinessMediaItem[]) {
  const ordered = orderPublicBusinessMedia(items);
  return ordered.find((item) => item.isCover)
    ?? ordered.find((item) => item.isFeatured)
    ?? ordered[0]
    ?? null;
}

export function getCanonicalPublicMediaGallery(items: BusinessMediaItem[]) {
  const ordered = orderPublicBusinessMedia(items);
  const cover = getCanonicalPublicMediaCover(ordered);
  return cover ? ordered.filter((item) => item.id !== cover.id) : ordered;
}

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
