import type { AdminManagedProperty } from "@/data/adminContent";
import type { Guesthouse, Room } from "@/types/guesthouse";

function toPublicRoom(room: AdminManagedProperty["roomTypes"][number], fallbackImage: string): Room {
  const priceMatch = room.price.match(/(?:USD|MVR|\$)?\s*([\d.]+)/i);
  const nightlyRate = room.price === "Price on request" ? null : Number(priceMatch?.[1] ?? 0) || null;
  const currency = room.price.toUpperCase().includes("MVR") ? "MVR" : "USD";
  return {
    id: room.id,
    name: room.name,
    price: room.price,
    capacity: room.capacity,
    occupancy: room.capacity,
    bedType: "",
    description: room.price === "Price on request" ? room.name : `${room.name} — ${room.price}.`,
    image: fallbackImage,
    amenities: [],
    breakfast: "",
    nightlyRate,
    currency
  };
}

export function adminPropertyToGuesthouse(property: AdminManagedProperty): Guesthouse {
  const heroImage = property.coverImage || property.gallery[0] || "";
  const firstPrice = property.roomTypes.find((room) => room.price)?.price ?? "Price on request";

  return {
    id: property.id,
    slug: property.slug,
    name: property.name,
    tagline: property.shortDescription,
    description: property.fullDescription || property.description || property.shortDescription,
    location: property.island ? `${property.island}, Maldives` : "Thoddoo, Maldives",
    distanceToBeach: "",
    rating: property.verificationStatus === "Verified" ? "Verified" : "New",
    verificationStatus: property.verificationStatus === "Verified" ? "Verified" : "New",
    priceFrom: firstPrice,
    whatsapp: property.whatsapp.replace(/[^0-9]/g, ""),
    heroImage,
    gallery: property.gallery.filter(Boolean),
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
    relatedExperienceSlugs: [],
    testimonialIds: [],
    rooms: property.roomTypes.map((room) => toPublicRoom(room, heroImage)),
    address: property.address,
    email: property.email,
    website: property.website,
    checkIn: property.checkIn,
    checkOut: property.checkOut,
    services: property.services
  };
}
