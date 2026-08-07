export type BusinessMediaType = "property" | "restaurant" | "experience" | "transfer";

export type BusinessMediaPurpose = "gallery" | "menu" | "logo" | "interior" | "exterior" | "food" | "cover";

export type BusinessMediaItem = {
  id: string;
  businessType: BusinessMediaType;
  businessId: string;
  mediaAssetId: string;
  url: string;
  fileName: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  storageBucket: string | null;
  storagePath: string | null;
  caption: string;
  altText: string;
  sortOrder: number;
  isCover: boolean;
  isFeatured: boolean;
  isPublic: boolean;
  mediaPurpose: BusinessMediaPurpose;
  source: "storage" | "legacy";
};

export type EditableBusinessMediaItem = Pick<
  BusinessMediaItem,
  "id" | "caption" | "altText" | "sortOrder" | "isCover" | "isFeatured" | "isPublic" | "mediaPurpose"
>;
