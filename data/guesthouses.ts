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
    whatsapp: "9609910136",
    heroImage: "/images/stay/guesthouse-front.jpg",
    gallery: [
      "/images/stay/guesthouse-front.jpg",
      "/images/rooms/deluxe-1.jpg",
      "/images/rooms/family-1.jpg",
      "/images/rooms/bathroom.jpg",
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
    rooms: [
      {
        name: "Deluxe Double Room",
        price: "$85 / night",
        capacity: "2 Adults",
        description:
          "Comfortable double room with air conditioning, private bathroom, and breakfast included.",
        image: "/images/rooms/deluxe-1.jpg",
      },
      {
        name: "Family Room",
        price: "$110 / night",
        capacity: "4 Adults",
        description:
          "Spacious room for families or groups with private bathroom and breakfast included.",
        image: "/images/rooms/family-1.jpg",
      },
    ],
  },
];

export function getGuesthouseBySlug(slug: string) {
  return guesthouses.find((guesthouse) => guesthouse.slug === slug);
}