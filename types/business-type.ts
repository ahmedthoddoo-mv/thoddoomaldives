export const canonicalBusinessTypes = [
  "guesthouse",
  "hotel",
  "restaurant",
  "cafe",
  "speedboat-company",
  "ferry-operator",
  "transfer-company",
  "excursion-operator",
  "dive-center",
  "watersports",
  "shop",
  "photographer",
  "wellness",
  "farm-experience",
  "local-guide",
  "other"
] as const;

export type BusinessType = (typeof canonicalBusinessTypes)[number];

export type BusinessTypeSchemaKind =
  | "accommodation"
  | "activity-service"
  | "dining"
  | "transfer"
  | "shop"
  | "wellness"
  | "business-service";

export type BusinessTypeDefinition = {
  id: BusinessType;
  label: string;
  description: string;
  schemaKind: BusinessTypeSchemaKind;
  listingWorkflow: "property" | "restaurant" | "transfer" | "experience" | "business";
};

const businessTypeDefinitions: Record<BusinessType, BusinessTypeDefinition> = {
  guesthouse: {
    id: "guesthouse",
    label: "Guesthouse",
    description: "Rooms, guest policies, amenities, and stay operations.",
    schemaKind: "accommodation",
    listingWorkflow: "property"
  },
  hotel: {
    id: "hotel",
    label: "Hotel",
    description: "Accommodation with structured room and service details.",
    schemaKind: "accommodation",
    listingWorkflow: "property"
  },
  restaurant: {
    id: "restaurant",
    label: "Restaurant",
    description: "Dining, menu, opening hours, and reservation details.",
    schemaKind: "dining",
    listingWorkflow: "restaurant"
  },
  cafe: {
    id: "cafe",
    label: "Cafe",
    description: "Coffee, snacks, casual dining, and menu details.",
    schemaKind: "dining",
    listingWorkflow: "restaurant"
  },
  "speedboat-company": {
    id: "speedboat-company",
    label: "Speedboat Company",
    description: "Routes, schedules, fares, and vessel details.",
    schemaKind: "transfer",
    listingWorkflow: "transfer"
  },
  "ferry-operator": {
    id: "ferry-operator",
    label: "Ferry Operator",
    description: "Public ferry routes, schedules, and fares.",
    schemaKind: "transfer",
    listingWorkflow: "transfer"
  },
  "transfer-company": {
    id: "transfer-company",
    label: "Transfer Company",
    description: "Private transfers, pickup, drop-off, and route pricing.",
    schemaKind: "transfer",
    listingWorkflow: "transfer"
  },
  "excursion-operator": {
    id: "excursion-operator",
    label: "Excursion Operator",
    description: "Tours, activities, inclusions, and schedules.",
    schemaKind: "activity-service",
    listingWorkflow: "experience"
  },
  "dive-center": {
    id: "dive-center",
    label: "Dive Center",
    description: "Dives, certifications, equipment, and safety details.",
    schemaKind: "activity-service",
    listingWorkflow: "experience"
  },
  watersports: {
    id: "watersports",
    label: "Watersports",
    description: "Water activities, equipment, safety, and add-ons.",
    schemaKind: "activity-service",
    listingWorkflow: "experience"
  },
  shop: {
    id: "shop",
    label: "Shop",
    description: "Products, opening hours, delivery, and price range.",
    schemaKind: "shop",
    listingWorkflow: "business"
  },
  photographer: {
    id: "photographer",
    label: "Photographer",
    description: "Photo, video, drone, and guest media packages.",
    schemaKind: "activity-service",
    listingWorkflow: "experience"
  },
  wellness: {
    id: "wellness",
    label: "Wellness",
    description: "Treatments, prices, booking hours, and duration.",
    schemaKind: "wellness",
    listingWorkflow: "business"
  },
  "farm-experience": {
    id: "farm-experience",
    label: "Farm Experience",
    description: "Farm activities, seasonal availability, and visitor prices.",
    schemaKind: "activity-service",
    listingWorkflow: "experience"
  },
  "local-guide": {
    id: "local-guide",
    label: "Local Guide",
    description: "Tours, languages, duration, and visitor prices.",
    schemaKind: "activity-service",
    listingWorkflow: "experience"
  },
  other: {
    id: "other",
    label: "Other",
    description: "Any other tourism-supporting business.",
    schemaKind: "business-service",
    listingWorkflow: "business"
  }
};

const businessTypeAliases: Record<string, BusinessType> = {
  accommodation: "guesthouse",
  guesthouses: "guesthouse",
  hotel: "hotel",
  hotels: "hotel",
  restaurant: "restaurant",
  restaurants: "restaurant",
  cafe: "cafe",
  cafes: "cafe",
  speedboat: "speedboat-company",
  "speedboat company": "speedboat-company",
  "speedboat companies": "speedboat-company",
  transfer: "transfer-company",
  transfers: "transfer-company",
  "transfer company": "transfer-company",
  "transfer companies": "transfer-company",
  ferry: "ferry-operator",
  "ferry operator": "ferry-operator",
  excursion: "excursion-operator",
  excursions: "excursion-operator",
  experience: "excursion-operator",
  experiences: "excursion-operator",
  "excursion operator": "excursion-operator",
  "excursion operators": "excursion-operator",
  diving: "dive-center",
  "dive center": "dive-center",
  "dive centre": "dive-center",
  watersport: "watersports",
  watersports: "watersports",
  "water sports": "watersports",
  shop: "shop",
  shops: "shop",
  photographer: "photographer",
  photography: "photographer",
  wellness: "wellness",
  "wellness spa": "wellness",
  "wellness-spa": "wellness",
  farm: "farm-experience",
  "farm experience": "farm-experience",
  guide: "local-guide",
  "local guide": "local-guide",
  "tour guide": "local-guide",
  "tour-guide": "local-guide",
  taxi: "transfer-company",
  "taxi service": "transfer-company",
  "taxi-service": "transfer-company"
};

function normalizeBusinessTypeKey(value: string) {
  return value
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function normalizeBusinessType(value: unknown): BusinessType {
  if (typeof value !== "string") return "other";
  if ((canonicalBusinessTypes as readonly string[]).includes(value)) return value as BusinessType;
  const normalized = normalizeBusinessTypeKey(value);
  return businessTypeAliases[normalized] ?? "other";
}

export function getBusinessTypeDefinition(value: unknown): BusinessTypeDefinition {
  return businessTypeDefinitions[normalizeBusinessType(value)];
}

export function getBusinessTypeLabel(value: unknown) {
  return getBusinessTypeDefinition(value).label;
}

export function getBusinessTypeSchemaKind(value: unknown) {
  return getBusinessTypeDefinition(value).schemaKind;
}

export function getBusinessTypeListingWorkflow(value: unknown) {
  return getBusinessTypeDefinition(value).listingWorkflow;
}

export const businessTypeOptions = canonicalBusinessTypes.map((id) => {
  const { label, description } = businessTypeDefinitions[id];
  return { id, label, description };
});
