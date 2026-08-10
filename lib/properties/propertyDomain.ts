import { getCanonicalPublicMediaGallery } from "../business-media/public.ts";
import { getGuesthouseDisplayPrice, getGuesthouseHeroMedia } from "@/lib/properties/guesthouse";
import type { AdminManagedProperty } from "../../data/adminContent.ts";
import type { Guesthouse, Room } from "../../types/guesthouse.ts";

function toPublicRoom(room: AdminManagedProperty["roomTypes"][number], fallbackImage: string): Room {
  const priceValue = typeof room.price === "string" ? room.price : null;
  const normalizedPrice = getGuesthouseDisplayPrice(priceValue);
  const priceMatch = normalizedPrice.match(/(?:USD|MVR|\$)?\s*([\d.]+)/i);
  const nightlyRate = normalizedPrice === "Price on request" ? null : Number(priceMatch?.[1] ?? 0) || null;
  const currency = normalizedPrice.toUpperCase().includes("MVR") ? "MVR" : "USD";
  const roomExtensions = room as { featured?: unknown; quantity?: unknown; gallery?: unknown };
  const gallery = Array.isArray(roomExtensions.gallery) ? roomExtensions.gallery.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
  return {
    id: room.id,
    name: room.name,
    price: normalizedPrice,
    capacity: room.capacity,
    occupancy: room.adults ? `${room.adults} adult${room.adults === 1 ? "" : "s"}${room.children ? ` + ${room.children} child${room.children === 1 ? "" : "ren"}` : ""}` : room.capacity,
    bedType: room.bedType ?? "",
    description: room.description || (normalizedPrice === "Price on request" ? room.name : `${room.name} — ${normalizedPrice}.`),
    image: room.image || fallbackImage,
    amenities: room.amenities ?? [],
    breakfast: room.breakfastIncluded ? "Included" : "Not included",
    featured: Boolean(roomExtensions.featured),
    quantity: typeof roomExtensions.quantity === "number" ? roomExtensions.quantity : undefined,
    gallery: gallery.length > 0 ? gallery : room.image ? [room.image] : [],
    nightlyRate,
    currency
  };
}

export function adminPropertyToGuesthouse(property: AdminManagedProperty): Guesthouse {
  const metadata = property as AdminManagedProperty & {
    metadata?: {
      facilities?: unknown;
      bookingChannels?: unknown;
      bookingLinks?: unknown;
      nearbyAttractions?: unknown;
      mapUrl?: unknown;
      propertyType?: unknown;
    };
  };
  const facilities = Array.isArray(metadata.metadata?.facilities)
    ? metadata.metadata?.facilities.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  const bookingChannels = Array.isArray(metadata.metadata?.bookingChannels)
    ? metadata.metadata?.bookingChannels.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  const bookingLinks = metadata.metadata?.bookingLinks && typeof metadata.metadata.bookingLinks === "object" && !Array.isArray(metadata.metadata.bookingLinks)
    ? metadata.metadata.bookingLinks as Record<string, unknown>
    : {};
  const metadataAttractions = Array.isArray(metadata.metadata?.nearbyAttractions)
    ? metadata.metadata?.nearbyAttractions.filter((item): item is { name: string; distance?: string; description?: string } => Boolean(item) && typeof item === "object" && "name" in item)
    : [];
  const publicMedia = (Array.isArray(property.media)
    ? (property.media as Array<{ url?: unknown; isPublic?: boolean }>).filter((item) => {
        const candidate = item as { url?: unknown; isPublic?: boolean } | undefined;
        if (!candidate || typeof candidate.url !== "string") {
          return false;
        }

        return candidate.url.trim().length > 0 && candidate.isPublic !== false;
      }).map((item) => ({
        ...item,
        url: item.url as string
      }))
    : []) as Guesthouse["media"];
  const mediaItems = publicMedia ?? [];
  const canonicalGallery = getCanonicalPublicMediaGallery(mediaItems);
  const heroMedia = getGuesthouseHeroMedia({
    heroImage: property.coverImage,
    gallery: property.gallery,
    media: mediaItems
  });
  const heroImage = heroMedia.heroImage;
  const gallery = canonicalGallery.length > 0
    ? canonicalGallery.map((item) => item.url).filter((url): url is string => Boolean(url && url.trim().length > 0))
    : heroMedia.gallery;
  const pricedRooms = property.roomTypes.filter((room) => room.price !== "Price on request").sort((a, b) => Number(a.price.match(/[\d.]+/)?.[0] ?? Infinity) - Number(b.price.match(/[\d.]+/)?.[0] ?? Infinity));
  const firstPrice = pricedRooms[0]?.price ?? "Price on request";

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
    gallery,
    media: publicMedia,
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
    nearbyAttractions: metadataAttractions.length > 0
      ? metadataAttractions.map((item) => ({
          name: item.name,
          distance: item.distance || "Nearby",
          description: item.description || "Ask the host for details."
        }))
      : [
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
    services: property.services,
    facilities,
    bookingChannels,
    bookingLinks: {
      bookingComUrl: typeof bookingLinks.bookingComUrl === "string" ? bookingLinks.bookingComUrl : undefined,
      airbnbUrl: typeof bookingLinks.airbnbUrl === "string" ? bookingLinks.airbnbUrl : undefined,
      expediaUrl: typeof bookingLinks.expediaUrl === "string" ? bookingLinks.expediaUrl : undefined,
      directBookingUrl: typeof bookingLinks.directBookingUrl === "string" ? bookingLinks.directBookingUrl : undefined
    },
    membershipBadge: property.membershipPlan,
    partnerBadge: "Partner listing",
    mapUrl: typeof metadata.metadata?.mapUrl === "string" && metadata.metadata?.mapUrl.trim().length > 0
      ? metadata.metadata?.mapUrl
      : property.googleMapsLink
  };
}
