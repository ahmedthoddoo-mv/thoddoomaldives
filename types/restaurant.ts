export type RestaurantCuisine =
  | "maldivian"
  | "seafood"
  | "cafe"
  | "international"
  | "healthy";

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
};
