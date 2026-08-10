import type { AdminPropertyRoomType } from "@/data/adminContent";

function parseRoomPrice(price: string) {
  const match = price.match(/[\d.]+/);
  const value = match ? Number.parseFloat(match[0]) : null;
  return value && value > 0 ? value : null;
}

function parseRoomAdults(capacity: string) {
  const match = capacity.match(/\d+/);
  return match ? Math.max(1, Number.parseInt(match[0], 10)) : 1;
}

export function buildAdminRoomPayload(rooms: AdminPropertyRoomType[], propertyAmenities: string[] = []) {
  return rooms
    .filter((room) => room.name.trim())
    .map((room) => {
      const priceText = room.price?.trim() ?? "";
      const amenities = Array.isArray(room.amenities)
        ? room.amenities.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        : [];
      const gallery = Array.isArray(room.gallery)
        ? room.gallery.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        : [];
      const breakfastIncluded = Boolean(
        room.breakfastIncluded ||
          amenities.some((entry) => entry.toLowerCase().includes("breakfast")) ||
          propertyAmenities.some((entry) => entry.toLowerCase().includes("breakfast"))
      );
      const parsedAdults = Number.isFinite(room.adults) && (room.adults ?? 0) > 0 ? room.adults! : parseRoomAdults(room.capacity ?? "");
      const parsedChildren = Number.isFinite(room.children) && (room.children ?? 0) >= 0 ? room.children! : 0;
      const parsedQuantity = Number.isFinite(room.quantity) && (room.quantity ?? 0) > 0 ? room.quantity! : 1;
      return {
        name: room.name.trim(),
        bed_type: room.bedType?.trim() || null,
        capacity: room.capacity?.trim() || "Capacity on request",
        adults: parsedAdults,
        children: parsedChildren,
        price_per_night: parseRoomPrice(priceText),
        currency: /mvr/i.test(priceText) ? "MVR" : "USD",
        breakfast_included: breakfastIncluded,
        description: room.description?.trim() || null,
        metadata: {
          featured: Boolean(room.featured),
          quantity: parsedQuantity,
          maxGuests: parsedAdults,
          amenities: amenities.join("\n"),
          gallery: gallery.join("\n")
        }
      };
    });
}
