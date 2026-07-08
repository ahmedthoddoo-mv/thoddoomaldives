import type { Guesthouse } from "@/types/guesthouse";

export const guesthouses: Guesthouse[] = [
  {
    id: "thoddoo-sun-sky-inn",
    slug: "thoddoo-sun-sky-inn",
    name: "Thoddoo Sun Sky Inn",
    tagline: "A peaceful tropical guesthouse in Thoddoo.",
    description:
      "Comfortable island stay with breakfast, Wi-Fi, air conditioning, private bathroom, bicycle rental, transfer help, and local hospitality.",
    location: "Thoddoo, Maldives",
    distanceToBeach: "Near Bikini Beach",
    rating: "4.9",
    priceFrom: "$85 / night",
    whatsapp: "9609910136",
    heroImage: "/images/hero-thoddoo.jpg",
    gallery: [
      "/images/hero-thoddoo.jpg",
      "/images/homepage/hero-1.jpg",
      "/images/homepage/hero-6.jpg",
      "/images/homepage/hero-4.jpg",
    ],
    amenities: [
      "Free Wi-Fi",
      "Air Conditioning",
      "Private Bathroom",
      "Hot Water",
      "Breakfast Included",
      "Bicycle Rental",
      "Airport Transfer Help",
      "Near Bikini Beach",
      "Excursion Assistance",
    ],
    about: [
      {
        title: "A calm local island base",
        body: "Thoddoo Sun Sky Inn is designed for travelers who want a comfortable guesthouse stay with easy access to island beaches, local cafes, farms, and excursions.",
      },
      {
        title: "Local support before and during your stay",
        body: "The team can help with airport transfer planning, room requests, bicycle rental, snorkeling trips, fishing, sandbank visits, and practical island guidance.",
      },
      {
        title: "Simple comfort for couples and families",
        body: "Rooms are air-conditioned and include private bathrooms, breakfast, Wi-Fi, and the essential comforts needed for a relaxed Thoddoo holiday.",
      },
    ],
    nearbyAttractions: [
      {
        name: "Bikini Beach",
        distance: "Nearby",
        description:
          "Thoddoo's main visitor beach for swimming, relaxing, sunset walks, and lagoon days.",
      },
      {
        name: "Thoddoo Farms",
        distance: "Short bicycle ride",
        description:
          "Fruit farms and island agriculture areas that show Thoddoo's famous watermelon-growing side.",
      },
      {
        name: "Thoddoo Harbour",
        distance: "Easy island access",
        description:
          "Arrival point for speedboats and a useful landmark for transfers and excursions.",
      },
    ],
    relatedExperienceSlugs: [
      "turtle-snorkeling",
      "sandbank-escape",
      "sunset-fishing",
    ],
    testimonialIds: [
      "maya-couple-trip",
      "daniel-family-holiday",
      "elena-solo-traveler",
    ],
    rooms: [
      {
        name: "Deluxe Double Room",
        price: "$85 / night",
        capacity: "2 Adults",
        occupancy: "2 Adults",
        bedType: "1 Double Bed",
        description:
          "Comfortable double room with air conditioning, private bathroom, and breakfast included.",
        image: "/images/hero-thoddoo.jpg",
        amenities: [
          "Air conditioning",
          "Private bathroom",
          "Hot water",
          "Free Wi-Fi",
        ],
        breakfast: "Breakfast included",
      },
      {
        name: "Family Room",
        price: "$110 / night",
        capacity: "4 Adults",
        occupancy: "4 Adults",
        bedType: "1 Double Bed + 2 Single Beds",
        description:
          "Spacious room for families or groups with private bathroom and breakfast included.",
        image: "/images/homepage/hero-1.jpg",
        amenities: [
          "Air conditioning",
          "Private bathroom",
          "Hot water",
          "Family layout",
        ],
        breakfast: "Breakfast included",
      },
    ],
  },
];

export function getGuesthouseBySlug(slug: string) {
  return guesthouses.find((guesthouse) => guesthouse.slug === slug);
}
