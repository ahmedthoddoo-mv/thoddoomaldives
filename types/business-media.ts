export type BusinessMediaType = "property" | "restaurant" | "experience" | "transfer";

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
  source: "storage" | "legacy";
};

export type EditableBusinessMediaItem = Pick<
  BusinessMediaItem,
  "id" | "caption" | "altText" | "sortOrder" | "isCover" | "isFeatured" | "isPublic"
>;
