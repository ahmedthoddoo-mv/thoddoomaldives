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
  priceRange: string;
  openingHours: string;
  image: string;
  featured: boolean;
};
