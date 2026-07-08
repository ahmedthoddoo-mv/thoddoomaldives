export type ExperienceCategory =
  | "snorkeling"
  | "fishing"
  | "island"
  | "water-sports"
  | "culture";

export type Experience = {
  slug: string;
  title: string;
  icon: string;
  price: string;
  duration: string;
  description: string;
  highlights: string[];
  category: ExperienceCategory;
  featured?: boolean;
  image?: string;
};

export const experienceCategories: Record<
  ExperienceCategory,
  { label: string; description: string }
> = {
  snorkeling: {
    label: "Snorkeling & Reef",
    description: "Crystal-clear lagoons, turtles, and vibrant coral reefs.",
  },
  fishing: {
    label: "Fishing Adventures",
    description: "Traditional Maldivian fishing at golden hour.",
  },
  island: {
    label: "Island & Sandbank",
    description: "Pristine sandbanks and unforgettable island scenery.",
  },
  "water-sports": {
    label: "Water Sports",
    description: "Kayaking, paddleboarding, and lagoon fun.",
  },
  culture: {
    label: "Local Culture",
    description: "Discover Thoddoo's farms, villages, and island life.",
  },
};

export const experiences: Experience[] = [
  {
    slug: "turtle-snorkeling",
    title: "Turtle Snorkeling",
    icon: "🐢",
    price: "From $35 per person",
    duration: "2–3 hours",
    description:
      "Swim alongside sea turtles in Thoddoo's protected reef areas with experienced local guides who know the best spots.",
    highlights: [
      "Local guide included",
      "Snorkeling equipment provided",
      "Turtle reef access",
      "Small group experience",
      "Photo opportunities",
    ],
    category: "snorkeling",
    featured: true,
    image: "/images/homepage/hero-4.jpg",
  },
  {
    slug: "sandbank-trip",
    title: "Sandbank Trip",
    icon: "🏝️",
    price: "From $60 per person",
    duration: "Half day",
    description:
      "Cruise to a stunning white-sand sandbank surrounded by turquoise water — perfect for swimming, photos, and a true Maldives moment.",
    highlights: [
      "Speedboat transfer included",
      "Crystal-clear lagoon swimming",
      "Ideal for couples and families",
      "Snorkeling stop on the way",
      "Flexible departure times",
    ],
    category: "island",
    image: "/images/hero-thoddoo.jpg",
  },
  {
    slug: "sunset-fishing",
    title: "Sunset Fishing",
    icon: "🎣",
    price: "From $40 per person",
    duration: "2–3 hours",
    description:
      "Join a traditional Maldivian fishing trip at sunset. Learn local techniques and enjoy the calm evening waters around Thoddoo.",
    highlights: [
      "Traditional line fishing",
      "Sunset departure",
      "Local captain and crew",
      "Catch-and-release friendly",
      "Complimentary refreshments",
    ],
    category: "fishing",
    image: "/images/homepage/hero-1.jpg",
  },
  {
    slug: "dolphin-cruise",
    title: "Dolphin Cruise",
    icon: "🐬",
    price: "From $50 per person",
    duration: "2 hours",
    description:
      "Watch spinner dolphins play in the open water near Thoddoo. A magical experience for families and nature lovers.",
    highlights: [
      "High chance of dolphin sightings",
      "Sunset or morning departures",
      "Comfortable speedboat",
      "Scenic lagoon cruise",
      "Great for photography",
    ],
    category: "island",
    image: "/images/homepage/hero-4.jpg",
  },
  {
    slug: "water-sports",
    title: "Water Sports",
    icon: "🌊",
    price: "On request",
    duration: "Flexible",
    description:
      "Kayaking, paddleboarding, and lagoon activities arranged with trusted local operators on Thoddoo's calm waters.",
    highlights: [
      "Kayak and paddleboard rental",
      "Beginner-friendly lagoon",
      "Guided options available",
      "Flexible hourly or half-day",
      "Perfect for active travellers",
    ],
    category: "water-sports",
    image: "/images/hero-thoddoo.jpg",
  },
  {
    slug: "watermelon-farm-tour",
    title: "Watermelon Farm Tour",
    icon: "🍉",
    price: "From $15 per person",
    duration: "1–2 hours",
    description:
      "Explore Thoddoo's famous agricultural side. Walk through lush farms, taste fresh tropical fruit, and learn about island farming life.",
    highlights: [
      "Guided farm walk",
      "Fresh fruit tasting",
      "Learn about island agriculture",
      "Family-friendly activity",
      "Unique Thoddoo experience",
    ],
    category: "culture",
    image: "/images/homepage/hero-6.jpg",
  },
];

export const featuredExperience =
  experiences.find((e) => e.featured) ?? experiences[0];
