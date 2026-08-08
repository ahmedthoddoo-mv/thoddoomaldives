export type RestaurantCuisine =
  | "maldivian"
  | "seafood"
  | "cafe"
  | "international"
  | "healthy";

export type RestaurantPromotion = {
  title: string | null;
  description: string | null;
  mediaUrl: string | null;
  ctaLabel: string | null;
  ctaDestination: string | null;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
};

export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  cuisine: RestaurantCuisine[];
  location: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  priceRange: string;
  openingHours: string;
  phone: string | null;
  whatsapp: string | null;
  partnerWhatsapp: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  image: string;
  gallery?: string[];
  media?: import("@/types/business-media").BusinessMediaItem[];
  featured: boolean;
  publicationStatus?: string;
  verificationStatus?: string;
  membershipTier?: string | null;
  membershipLabel?: string | null;
  showOriginalMenu?: boolean;
  promotion?: RestaurantPromotion | null;
};
