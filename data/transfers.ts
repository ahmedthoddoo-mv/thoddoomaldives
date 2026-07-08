import type { Transfer } from "@/types/transfer";

export const transfers: Transfer[] = [
  {
    id: "public-speedboat",
    slug: "public-speedboat",
    title: "Public Speedboat",
    type: "public-speedboat",
    description:
      "The most common way to travel between Velana International Airport, Male, and Thoddoo.",
    duration: "Around 1 hour 15 minutes",
    price: "From USD 35 per person",
    departurePoint: "Male / Velana International Airport area",
    arrivalPoint: "Thoddoo harbour",
    scheduleNote: "Schedules can change due to season, demand, and weather.",
    image: "/images/homepage/hero-2.jpg",
    highlights: [
      "Most popular option",
      "Advance booking recommended",
      "Good for most arrivals",
    ],
    featured: true,
  },
  {
    id: "private-speedboat",
    slug: "private-speedboat",
    title: "Private Speedboat",
    type: "private-speedboat",
    description:
      "A flexible private transfer option for families, groups, late arrivals, or guests who prefer direct travel.",
    duration: "Around 1 hour",
    price: "Price on request",
    departurePoint: "Airport or Male pickup by arrangement",
    arrivalPoint: "Thoddoo harbour",
    scheduleNote: "Subject to weather, sea conditions, and operator availability.",
    image: "/images/homepage/hero-6.jpg",
    highlights: [
      "Flexible timing",
      "Best for groups",
      "Airport pickup possible",
    ],
    featured: true,
  },
];

export function getTransferBySlug(slug: string) {
  return transfers.find((transfer) => transfer.slug === slug);
}
