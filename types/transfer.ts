export type TransferType =
  | "public-speedboat"
  | "private-speedboat"
  | "public-ferry"
  | "seaplane";

export type Transfer = {
  id: string;
  slug: string;
  title: string;
  type: TransferType;
  description: string;
  duration: string;
  price: string;
  departurePoint: string;
  arrivalPoint: string;
  scheduleNote: string;
  image: string;
  gallery?: string[];
  media?: import("@/types/business-media").BusinessMediaItem[];
  highlights: string[];
  featured: boolean;
  publicationStatus?: string;
  verificationStatus?: string;
};
