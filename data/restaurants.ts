import type { Restaurant } from "@/types/restaurant";

export const restaurants: Restaurant[] = [
  {
    id: "island-cafe",
    slug: "island-cafe",
    name: "Island Cafe",
    tagline: "Easy local meals, fresh juice, and relaxed island service.",
    description:
      "A casual Thoddoo cafe option for guests looking for simple local meals, snacks, and drinks during the day.",
    cuisine: ["maldivian", "cafe", "seafood"],
    location: "Thoddoo, Maldives",
    priceRange: "$$",
    openingHours: "Daily hours vary by season",
    image: "/images/homepage/hero-5.jpg",
    featured: true,
  },
  {
    id: "harbour-grill",
    slug: "harbour-grill",
    name: "Harbour Grill",
    tagline: "Seafood and international dishes close to island life.",
    description:
      "A guest-friendly restaurant concept for dinner plans, grilled seafood, and relaxed meals after excursions.",
    cuisine: ["seafood", "international"],
    location: "Near Thoddoo harbour",
    priceRange: "$$",
    openingHours: "Evening service, confirm locally",
    image: "/images/homepage/hero-2.jpg",
    featured: false,
  },
];

export function getRestaurantBySlug(slug: string) {
  return restaurants.find((restaurant) => restaurant.slug === slug);
}
