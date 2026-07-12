import type { AdminManagedProperty } from "@/data/adminContent";
import type { Guesthouse, Room } from "@/types/guesthouse";

function toPublicRoom(room: AdminManagedProperty["roomTypes"][number], fallbackImage: string): Room {
  return {
    id: room.id,
    name: room.name,
    price: room.price,
    capacity: room.capacity,
    occupancy: room.capacity,
    bedType: "Flexible bedding",
    description: `${room.name} at ${room.price}.`,
    image: fallbackImage,
    amenities: ["Air conditioning", "Private bathroom", "Wi-Fi"],
    breakfast: "Confirm breakfast with property"
  };
}

export function adminPropertyToGuesthouse(property: AdminManagedProperty): Guesthouse {
  const heroImage = property.coverImage || property.gallery[0] || "/images/hero-thoddoo.jpg";
  const firstPrice = property.roomTypes.find((room) => room.price)?.price ?? "Price on request";

  return {
    id: property.id,
    slug: property.slug,
    name: property.name,
    tagline: property.shortDescription,
    description: property.fullDescription || property.description || property.shortDescription,
    location: property.island ? `${property.island}, Maldives` : "Thoddoo, Maldives",
    distanceToBeach: "Beach access details available on request",
    rating: property.verificationStatus === "Verified" ? "Verified" : "New",
    priceFrom: firstPrice,
    whatsapp: property.whatsapp.replace(/[^0-9]/g, "") || "9609142538",
    heroImage,
    gallery: property.gallery.length > 0 ? property.gallery : [heroImage],
    amenities: property.amenities,
    about: [
      {
        title: "About this property",
        body: property.fullDescription || property.shortDescription
      },
      {
        title: "Policies",
        body: property.policies.join(" ") || "Policies will be confirmed directly with the property."
      }
    ],
    nearbyAttractions: [
      {
        name: property.island,
        distance: "Local island stay",
        description: property.googleMaps || property.address || "Exact location details can be confirmed before arrival."
      }
    ],
    relatedExperienceSlugs: ["turtle-snorkeling", "sandbank-escape", "sunset-fishing"],
    testimonialIds: [],
    rooms: property.roomTypes.map((room) => toPublicRoom(room, heroImage))
  };
}
