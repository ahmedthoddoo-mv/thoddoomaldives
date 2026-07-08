import type { Experience } from "@/types/experience";

export const experiences: Experience[] = [
  {
    id: "turtle-snorkeling",
    slug: "turtle-snorkeling",
    title: "Turtle Snorkeling",
    tagline: "Swim with turtles in clear Thoddoo reef areas.",
    description:
      "A guided snorkeling experience for guests who want calm water, local reef knowledge, and a chance to see turtles around Thoddoo.",
    category: "snorkeling",
    duration: "2-3 hours",
    price: "From USD 35 per person",
    image: "/images/homepage/hero-1.jpg",
    highlights: [
      "Local guide",
      "Snorkeling equipment",
      "Small group option",
      "Weather-aware timing",
    ],
    featured: true,
  },
  {
    id: "sandbank-escape",
    slug: "sandbank-escape",
    title: "Sandbank Escape",
    tagline: "A postcard-perfect lagoon day near Thoddoo.",
    description:
      "Travel by boat to a white-sand sandbank for swimming, photos, and a peaceful Maldives island moment.",
    category: "sandbank",
    duration: "Half day",
    price: "From USD 60 per person",
    image: "/images/homepage/hero-3.jpg",
    highlights: [
      "Boat transfer",
      "Lagoon swimming",
      "Photo time",
      "Private options available",
    ],
    featured: true,
  },
  {
    id: "sunset-fishing",
    slug: "sunset-fishing",
    title: "Sunset Fishing",
    tagline: "Traditional Maldivian fishing at golden hour.",
    description:
      "Join a local crew for a relaxed fishing trip and experience the ocean around Thoddoo as the sun goes down.",
    category: "fishing",
    duration: "2-3 hours",
    price: "From USD 40 per person",
    image: "/images/homepage/hero-4.jpg",
    highlights: [
      "Local captain",
      "Traditional line fishing",
      "Sunset departure",
      "Family-friendly",
    ],
    featured: true,
  },
];

export function getExperienceBySlug(slug: string) {
  return experiences.find((experience) => experience.slug === slug);
}
