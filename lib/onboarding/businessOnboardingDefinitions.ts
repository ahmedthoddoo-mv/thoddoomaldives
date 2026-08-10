import { getBusinessTypeListingWorkflow, normalizeBusinessType } from "../../types/business-type.ts";

export type BusinessOnboardingCategoryKey = "restaurant" | "guesthouse" | "experience" | "transfer";
export type BusinessOnboardingStepId =
  | "business"
  | "contact"
  | "location"
  | "hours"
  | "property-details"
  | "rooms"
  | "amenities-facilities"
  | "media"
  | "policies-booking"
  | "membership"
  | "restaurant-module"
  | "experience-module"
  | "transfer-module"
  | "review"
  | "publish";

export type BusinessOnboardingStepDefinition = {
  id: BusinessOnboardingStepId;
  label: string;
  description: string;
};

export type BusinessOnboardingDefinition = {
  key: BusinessOnboardingCategoryKey;
  label: string;
  description: string;
  commonSteps: BusinessOnboardingStepDefinition[];
  categorySteps: BusinessOnboardingStepDefinition[];
};

export type BusinessOnboardingValue = string | boolean | number | string[] | Record<string, unknown> | undefined;
export type BusinessOnboardingValues = Record<string, BusinessOnboardingValue>;
export type GuesthouseRoomDraft = {
  id: string;
  name: string;
  description: string;
  maxGuests: number;
  bedType: string;
  quantity: number;
  basePrice: string;
  gallery: string[];
  amenities: string[];
  featured: boolean;
};

const commonSteps: BusinessOnboardingStepDefinition[] = [
  { id: "business", label: "Business", description: "Business identity, category, and summary." },
  { id: "contact", label: "Contact", description: "Phone, email, social links, and website." },
  { id: "location", label: "Location", description: "Island, address, and coordinates." }
];

const restaurantCommonSteps: BusinessOnboardingStepDefinition[] = [
  ...commonSteps,
  { id: "hours", label: "Hours", description: "Operating schedule and availability." },
  { id: "media", label: "Media", description: "Logo, cover, gallery, and featured status." },
  { id: "membership", label: "Membership", description: "Tier and protected admin fields." },
  { id: "review", label: "Review", description: "Preview the final public profile." }
];

const guesthouseCommonSteps: BusinessOnboardingStepDefinition[] = [
  ...commonSteps
];

const categoryDefinitions: Record<BusinessOnboardingCategoryKey, BusinessOnboardingDefinition> = {
  restaurant: {
    key: "restaurant",
    label: "Restaurant",
    description: "Dining, digital menus, promotion, and menu source upload support.",
    commonSteps: restaurantCommonSteps,
    categorySteps: [
      { id: "restaurant-module", label: "Restaurant", description: "Cuisine, price range, promotions, and menu import review." },
      { id: "publish", label: "Publish", description: "Verification and publication controls." }
    ]
  },
  guesthouse: {
    key: "guesthouse",
    label: "Guesthouse",
    description: "Room types and stay-focused details for future onboarding expansion.",
    commonSteps: guesthouseCommonSteps,
    categorySteps: [
      { id: "property-details", label: "Property Details", description: "Property type, room count, check-in/out, and languages." },
      { id: "rooms", label: "Rooms", description: "Room setup, pricing, amenities, gallery, and ordering." },
      { id: "amenities-facilities", label: "Amenities & Facilities", description: "Property amenities, facilities, and nearby attractions." },
      { id: "media", label: "Media", description: "Logo, cover, room and property gallery media." },
      { id: "policies-booking", label: "Policies & Booking", description: "Guesthouse policies and booking channel links." },
      { id: "membership", label: "Membership", description: "Tier and protected admin fields." },
      { id: "review", label: "Review", description: "Preview the final public guesthouse profile." },
      { id: "publish", label: "Publish", description: "Verification and publication controls." }
    ]
  },
  experience: {
    key: "experience",
    label: "Experience",
    description: "Activities, duration, inclusions, and departure flow placeholders.",
    commonSteps,
    categorySteps: [
      { id: "experience-module", label: "Experience", description: "Experience-specific readiness placeholders." },
      { id: "publish", label: "Publish", description: "Verification and publication controls." }
    ]
  },
  transfer: {
    key: "transfer",
    label: "Transfer",
    description: "Routes, pricing, schedules, and transfer-specific placeholders.",
    commonSteps,
    categorySteps: [
      { id: "transfer-module", label: "Transfer", description: "Transfer-specific readiness placeholders." },
      { id: "publish", label: "Publish", description: "Verification and publication controls." }
    ]
  }
};

export function getBusinessOnboardingDefinition(kind: string): BusinessOnboardingDefinition {
  const normalizedBusinessType = normalizeBusinessType(kind);
  const workflow = getBusinessTypeListingWorkflow(normalizedBusinessType);
  const normalizedKey = workflow === "property"
    ? "guesthouse"
    : workflow === "restaurant"
      ? "restaurant"
      : workflow === "transfer"
        ? "transfer"
        : workflow === "experience"
          ? "experience"
          : "restaurant";
  return categoryDefinitions[normalizedKey] ?? categoryDefinitions.restaurant;
}

export function getBusinessOnboardingSteps(kind: string) {
  const definition = getBusinessOnboardingDefinition(kind);
  return [...definition.commonSteps, ...definition.categorySteps];
}

export function getDefaultBusinessOnboardingValues(kind: string): BusinessOnboardingValues {
  const definition = getBusinessOnboardingDefinition(kind);
  return {
    businessType: definition.key,
    title: "",
    slug: "",
    shortDescription: "",
    description: "",
    phone: "",
    whatsapp: "",
    email: "",
    website: "",
    instagram: "",
    facebook: "",
    island: "",
    address: "",
    latitude: "",
    longitude: "",
    hoursMode: "same-hours",
    hoursText: "Open daily from 10:00 to 22:00",
    isClosed: false,
    coverUrl: "",
    logoUrl: "",
    galleryUrl: "",
    featured: false,
    membershipTier: "starter",
    protectedFieldNote: "Admin controls verification, publication, and featured status.",
    publicationStatus: "draft",
    verificationStatus: "pending",
    propertyType: "",
    numberOfRooms: "",
    checkIn: "",
    checkOut: "",
    languagesSpoken: "",
    mapUrl: "",
    bookingComUrl: "",
    airbnbUrl: "",
    expediaUrl: "",
    directBookingUrl: "",
    facilities: "",
    bookingChannels: "",
    nearbyAttractions: "",
    guesthousePolicies: "",
    guesthouseRooms: "[]",
    showOriginalMenu: false,
    cuisine: "",
    priceRange: "",
    sourceMenuUrl: "",
    interactiveMenu: "[]",
    promotionTitle: "",
    promotionDescription: "",
    promotionMediaUrl: "",
    promotionCtaLabel: "",
    promotionCtaDestination: "",
    promotionActive: false
  };
}

export function buildSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "business";
}

export function validateBusinessOnboardingStep(definition: BusinessOnboardingDefinition, values: BusinessOnboardingValues, stepId: string) {
  const errors: string[] = [];

  if (stepId === "business") {
    if (!String(values.title ?? "").trim()) errors.push("Business name is required.");
    if (!String(values.slug ?? "").trim()) errors.push("A slug is required.");
  }

  if (stepId === "contact") {
    if (String(values.email ?? "").trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values.email))) {
      errors.push("Email must be a valid address.");
    }
    if (String(values.website ?? "").trim() && !/^https?:\/\//i.test(String(values.website))) {
      errors.push("Website should include https:// or http://.");
    }
  }

  if (stepId === "location") {
    if (!String(values.island ?? "").trim()) errors.push("Island is required.");
    if (String(values.latitude ?? "").trim() && Number.isNaN(Number(values.latitude))) errors.push("Latitude must be numeric.");
    if (String(values.longitude ?? "").trim() && Number.isNaN(Number(values.longitude))) errors.push("Longitude must be numeric.");
  }

  if (stepId === "hours") {
    if (!String(values.hoursText ?? "").trim()) errors.push("Please add operating hours.");
  }

  if (stepId === "restaurant-module") {
    if (!String(values.cuisine ?? "").trim()) errors.push("Cuisine is required.");
    if (!String(values.priceRange ?? "").trim()) errors.push("Price range is required.");
  }

  if (stepId === "property-details") {
    if (!String(values.propertyType ?? "").trim()) errors.push("Property type is required.");
    if (!String(values.checkIn ?? "").trim()) errors.push("Check-in time is required.");
    if (!String(values.checkOut ?? "").trim()) errors.push("Check-out time is required.");
    if (!String(values.numberOfRooms ?? "").trim()) errors.push("Number of rooms is required.");
  }

  if (stepId === "rooms") {
    const rooms = parseGuesthouseRooms(values.guesthouseRooms);
    if (rooms.length < 1) errors.push("Add at least one room.");
    if (rooms.some((room) => !room.name.trim())) errors.push("Every room requires a name.");
    if (rooms.some((room) => !room.basePrice.trim())) errors.push("Every room requires a base price.");
  }

  if (stepId === "amenities-facilities") {
    if (!String(values.facilities ?? "").trim()) errors.push("Add at least one facility.");
  }

  if (stepId === "policies-booking") {
    if (!String(values.whatsapp ?? "").trim()) errors.push("WhatsApp is required.");
    if (!String(values.mapUrl ?? "").trim() && (!String(values.latitude ?? "").trim() || !String(values.longitude ?? "").trim())) {
      errors.push("Add a map link or latitude and longitude.");
    }
    if (!String(values.guesthousePolicies ?? "").trim()) errors.push("Add at least one policy.");
  }

  if (stepId === "publish") {
    if (String(values.publicationStatus ?? "") === "published" && String(values.verificationStatus ?? "") !== "verified") {
      errors.push("Only verified listings can be published.");
    }
  }

  return errors;
}

export function mergeBusinessOnboardingValues(existing: BusinessOnboardingValues, incoming: BusinessOnboardingValues) {
  return { ...existing, ...incoming };
}

export function getBusinessOnboardingLabel(kind: string) {
  return getBusinessOnboardingDefinition(kind).label;
}

export function parseGuesthouseRooms(value: unknown): GuesthouseRoomDraft[] {
  if (typeof value !== "string") return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object" && !Array.isArray(entry))
      .map((entry, index) => ({
        id: typeof entry.id === "string" && entry.id.trim() ? entry.id : `room-${index + 1}`,
        name: typeof entry.name === "string" ? entry.name : "",
        description: typeof entry.description === "string" ? entry.description : "",
        maxGuests: typeof entry.maxGuests === "number" ? entry.maxGuests : Number(entry.maxGuests ?? 0) || 0,
        bedType: typeof entry.bedType === "string" ? entry.bedType : "",
        quantity: typeof entry.quantity === "number" ? entry.quantity : Number(entry.quantity ?? 1) || 1,
        basePrice: typeof entry.basePrice === "string" ? entry.basePrice : "",
        gallery: Array.isArray(entry.gallery) ? entry.gallery.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [],
        amenities: Array.isArray(entry.amenities) ? entry.amenities.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [],
        featured: Boolean(entry.featured)
      }));
  } catch {
    return [];
  }
}

export function serializeGuesthouseRooms(rooms: GuesthouseRoomDraft[]) {
  return JSON.stringify(rooms);
}
