import { normalizeBusinessType } from "../../types/business-type.ts";

export type BusinessOnboardingCategoryKey = "restaurant" | "guesthouse" | "experience" | "transfer";
export type BusinessOnboardingStepId = "business" | "contact" | "location" | "hours" | "media" | "membership" | "restaurant-module" | "guesthouse-module" | "experience-module" | "transfer-module" | "review" | "publish";

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

const commonSteps: BusinessOnboardingStepDefinition[] = [
  { id: "business", label: "Business", description: "Business identity, category, and summary." },
  { id: "contact", label: "Contact", description: "Phone, email, social links, and website." },
  { id: "location", label: "Location", description: "Island, address, and coordinates." },
  { id: "hours", label: "Hours", description: "Operating schedule and availability." },
  { id: "media", label: "Media", description: "Logo, cover, gallery, and featured status." },
  { id: "membership", label: "Membership", description: "Tier and protected admin fields." },
  { id: "review", label: "Review", description: "Preview the final public profile." }
];

const categoryDefinitions: Record<BusinessOnboardingCategoryKey, BusinessOnboardingDefinition> = {
  restaurant: {
    key: "restaurant",
    label: "Restaurant",
    description: "Dining, digital menus, promotion, and menu source upload support.",
    commonSteps,
    categorySteps: [
      { id: "restaurant-module", label: "Restaurant", description: "Cuisine, price range, promotions, and menu import review." },
      { id: "publish", label: "Publish", description: "Verification and publication controls." }
    ]
  },
  guesthouse: {
    key: "guesthouse",
    label: "Guesthouse",
    description: "Room types and stay-focused details for future onboarding expansion.",
    commonSteps,
    categorySteps: [
      { id: "guesthouse-module", label: "Guesthouse", description: "Guesthouse-specific readiness placeholders." },
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
  const normalizedKey = normalizeBusinessType(kind) as BusinessOnboardingCategoryKey;
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
