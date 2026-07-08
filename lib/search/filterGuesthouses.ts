import type { Guesthouse } from "@/types/guesthouse";

export type GuesthouseFilters = {
  query?: string;
  maxPrice?: number;
  minRating?: number;
  distanceToBeach?: string;
  breakfast?: boolean;
  airConditioning?: boolean;
  familyRooms?: boolean;
  couples?: boolean;
  groups?: boolean;
};

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function includesText(source: string, query?: string) {
  if (!query) return true;
  return normalize(source).includes(normalize(query));
}

function extractNumber(value: string) {
  const match = value.match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function hasAmenity(guesthouse: Guesthouse, amenity: string) {
  const target = normalize(amenity);
  const propertyAmenities = guesthouse.amenities.some((item) =>
    normalize(item).includes(target)
  );
  const roomAmenities = guesthouse.rooms.some((room) =>
    room.amenities.some((item) => normalize(item).includes(target))
  );

  return propertyAmenities || roomAmenities;
}

export function filterGuesthouses(
  guesthouses: Guesthouse[],
  filters: GuesthouseFilters
) {
  return guesthouses.filter((guesthouse) => {
    const searchableText = [
      guesthouse.name,
      guesthouse.tagline,
      guesthouse.description,
      guesthouse.location,
      guesthouse.distanceToBeach,
      ...guesthouse.amenities,
      ...guesthouse.rooms.map((room) => room.name),
    ].join(" ");

    if (!includesText(searchableText, filters.query)) return false;
    if (filters.maxPrice && extractNumber(guesthouse.priceFrom) > filters.maxPrice) {
      return false;
    }
    if (filters.minRating && Number(guesthouse.rating) < filters.minRating) {
      return false;
    }
    if (
      filters.distanceToBeach &&
      !includesText(guesthouse.distanceToBeach, filters.distanceToBeach)
    ) {
      return false;
    }
    if (filters.breakfast && !hasAmenity(guesthouse, "breakfast")) return false;
    if (filters.airConditioning && !hasAmenity(guesthouse, "air conditioning")) {
      return false;
    }
    if (
      filters.familyRooms &&
      !guesthouse.rooms.some((room) => includesText(room.name, "family"))
    ) {
      return false;
    }
    if (
      filters.couples &&
      !guesthouse.rooms.some((room) => includesText(room.occupancy, "2"))
    ) {
      return false;
    }
    if (
      filters.groups &&
      !guesthouse.rooms.some((room) => extractNumber(room.occupancy) >= 4)
    ) {
      return false;
    }

    return true;
  });
}
