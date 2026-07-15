import type {
  PartnerApplicationPriceInput,
  PricingUnit,
  SmartBusinessType
} from "@/types/partner-smart-onboarding";
import {
  businessTypeOptions as canonicalBusinessTypeOptions,
  getBusinessTypeDefinition,
  getBusinessTypeSchemaKind,
  normalizeBusinessType,
  type BusinessTypeSchemaKind
} from "@/types/business-type";

export type OnboardingFieldDefinition = {
  key: string;
  label: string;
  placeholder: string;
  type?: "text" | "textarea" | "checkbox";
  help?: string;
  required?: boolean;
};

export type PricingEditorCopy = {
  heading: string;
  helper: string;
  rowLabel: string;
  itemLabel: string;
  itemPlaceholder: string;
  descriptionPlaceholder: string;
  priceLabel: string;
  childPriceLabel: string;
  notesPlaceholder: string;
  addLabel: string;
  defaultUnit: PricingUnit;
};

export type BusinessTypeOption = {
  id: SmartBusinessType;
  label: string;
  description: string;
};

export type BusinessTypeSchema = BusinessTypeOption & {
  schemaKind: BusinessTypeSchemaKind;
  sectionTitle: string;
  sectionDescription: string;
  fields: OnboardingFieldDefinition[];
  pricing: PricingEditorCopy;
};

const accommodationPricing: PricingEditorCopy = {
  heading: "Room pricing",
  helper: "Add each sellable room type with its nightly rate and guest notes.",
  rowLabel: "Room type",
  itemLabel: "Room type name",
  itemPlaceholder: "Deluxe Double, Family Room, Suite...",
  descriptionPlaceholder: "Beds, view, inclusions, and guest fit",
  priceLabel: "Price per night",
  childPriceLabel: "Child or extra bed price",
  notesPlaceholder: "Seasonal rates, breakfast terms, extra bed rules...",
  addLabel: "Add room price",
  defaultUnit: "per night"
};

const activityPricing: PricingEditorCopy = {
  heading: "Activity/service pricing",
  helper: "Add each tour, activity, guided service, package, or equipment-supported offer.",
  rowLabel: "Activity/service",
  itemLabel: "Activity/service name",
  itemPlaceholder: "Turtle snorkeling, Discover scuba, Jet ski session...",
  descriptionPlaceholder: "Duration, inclusions, safety notes, or meeting point",
  priceLabel: "Adult price",
  childPriceLabel: "Child price",
  notesPlaceholder: "Private trip surcharge, weather policy, pickup terms...",
  addLabel: "Add activity price",
  defaultUnit: "per person"
};

const diningPricing: PricingEditorCopy = {
  heading: "Menu pricing",
  helper: "Add featured dishes, set menus, delivery items, or reservation packages.",
  rowLabel: "Menu item",
  itemLabel: "Dish/menu item",
  itemPlaceholder: "Grilled reef fish, Maldivian breakfast, Fresh juice...",
  descriptionPlaceholder: "Ingredients, portion, dietary notes, or serving time",
  priceLabel: "Menu price",
  childPriceLabel: "Kids menu price",
  notesPlaceholder: "Delivery, reservation, spice level, seasonal availability...",
  addLabel: "Add menu item",
  defaultUnit: "per package"
};

const transferPricing: PricingEditorCopy = {
  heading: "Route pricing",
  helper: "Add each public route, private transfer, ferry fare, or charter option.",
  rowLabel: "Route/fare",
  itemLabel: "Route or fare name",
  itemPlaceholder: "Airport to Thoddoo, Male to Thoddoo, Private charter...",
  descriptionPlaceholder: "Departure point, schedule, vessel, or luggage notes",
  priceLabel: "One-way price",
  childPriceLabel: "Child fare",
  notesPlaceholder: "Return fare, cancellation, cutoff time, weather terms...",
  addLabel: "Add route price",
  defaultUnit: "per transfer"
};

const shopPricing: PricingEditorCopy = {
  heading: "Product pricing",
  helper: "Add product groups, featured products, delivery items, or visitor bundles.",
  rowLabel: "Product",
  itemLabel: "Product name",
  itemPlaceholder: "Souvenir bundle, beachwear, local snacks...",
  descriptionPlaceholder: "Product details, sizes, availability, or delivery terms",
  priceLabel: "Price",
  childPriceLabel: "Child/variant price",
  notesPlaceholder: "Stock notes, delivery area, seasonal items...",
  addLabel: "Add product",
  defaultUnit: "per package"
};

const photographerPricing: PricingEditorCopy = {
  heading: "Package pricing",
  helper: "Add each photo, video, drone, or event coverage package.",
  rowLabel: "Package",
  itemLabel: "Package name",
  itemPlaceholder: "Couple shoot, family session, drone add-on...",
  descriptionPlaceholder: "Duration, edited photos, delivery time, locations",
  priceLabel: "Starting price",
  childPriceLabel: "Add-on price",
  notesPlaceholder: "Extra hour, video option, travel, delivery notes...",
  addLabel: "Add package",
  defaultUnit: "per package"
};

const wellnessPricing: PricingEditorCopy = {
  heading: "Treatment pricing",
  helper: "Add each treatment, session, class, or wellness package.",
  rowLabel: "Treatment",
  itemLabel: "Treatment name",
  itemPlaceholder: "Island massage, yoga class, facial treatment...",
  descriptionPlaceholder: "Duration, therapist notes, inclusions, booking hours",
  priceLabel: "Treatment price",
  childPriceLabel: "Optional add-on price",
  notesPlaceholder: "Advance booking, credentials, location, seasonal notes...",
  addLabel: "Add treatment",
  defaultUnit: "per hour"
};

const guidePricing: PricingEditorCopy = {
  heading: "Tour pricing",
  helper: "Add guided walks, farm visits, cultural tours, or custom guide packages.",
  rowLabel: "Tour",
  itemLabel: "Tour/activity name",
  itemPlaceholder: "Island history walk, farm tour, local food walk...",
  descriptionPlaceholder: "Duration, languages, meeting point, included items",
  priceLabel: "Tour price",
  childPriceLabel: "Child price",
  notesPlaceholder: "Maximum guests, pickup, seasonality, private tour notes...",
  addLabel: "Add tour price",
  defaultUnit: "per person"
};

const otherPricing: PricingEditorCopy = {
  heading: "Service pricing",
  helper: "Add the services, packages, or offers visitors can request.",
  rowLabel: "Service",
  itemLabel: "Service name",
  itemPlaceholder: "Service package, visitor offer, custom request...",
  descriptionPlaceholder: "What is included and how visitors can book",
  priceLabel: "Starting price",
  childPriceLabel: "Optional child/variant price",
  notesPlaceholder: "Availability, booking terms, inclusions...",
  addLabel: "Add service price",
  defaultUnit: "per package"
};

const accommodationFields: OnboardingFieldDefinition[] = [
  { key: "roomCount", label: "Number of rooms", placeholder: "Example: 8 rooms", required: true },
  { key: "roomTypes", label: "Room types", placeholder: "Deluxe Double, Family Room, Suite", type: "textarea", required: true },
  { key: "bedTypes", label: "Bed types", placeholder: "Queen, twin, king, extra bed...", required: true },
  { key: "roomCapacity", label: "Room capacity", placeholder: "Example: 2 adults + 1 child", required: true },
  { key: "adults", label: "Adults", placeholder: "Maximum adults per room" },
  { key: "children", label: "Children", placeholder: "Maximum children per room" },
  { key: "breakfastIncluded", label: "Breakfast included", placeholder: "", type: "checkbox" },
  { key: "amenities", label: "Amenities", placeholder: "Wi-Fi, breakfast, bicycles, beach towels...", type: "textarea", required: true },
  { key: "checkInTime", label: "Check-in", placeholder: "14:00", required: true },
  { key: "checkOutTime", label: "Check-out", placeholder: "12:00", required: true },
  { key: "childPolicy", label: "Child policy", placeholder: "Children welcome, ages, charges..." },
  { key: "extraBedPolicy", label: "Extra bed policy", placeholder: "Available on request, fee..." },
  { key: "cancellationPolicy", label: "Cancellation policy", placeholder: "Free cancellation until..." },
  { key: "airportTransfer", label: "Airport transfer assistance", placeholder: "Public speedboat, private transfer..." },
  { key: "bikiniBeachDistance", label: "Bikini beach distance", placeholder: "Example: 7 minutes walk" },
  { key: "roomPhotos", label: "Room photos", placeholder: "Paste image paths or describe required photos", type: "textarea" },
  { key: "availabilityMethod", label: "Availability update method", placeholder: "WhatsApp, Google Sheet, portal..." }
];

const activityFields: OnboardingFieldDefinition[] = [
  { key: "activityName", label: "Activity/service name", placeholder: "Turtle snorkeling, sandbank escape, island photo walk...", required: true },
  { key: "activityCategory", label: "Category", placeholder: "Snorkeling, diving, watersports, farm tour, local guide...", required: true },
  { key: "duration", label: "Duration", placeholder: "2 hours, half-day, full-day", required: true },
  { key: "minGuests", label: "Minimum guests", placeholder: "Example: 2" },
  { key: "maxGuests", label: "Maximum guests", placeholder: "Example: 12", required: true },
  { key: "includedItems", label: "Included items", placeholder: "Guide, water, equipment, pickup, photos...", type: "textarea" },
  { key: "excludedItems", label: "Excluded items", placeholder: "Meals, towels, private transfer, photos...", type: "textarea" },
  { key: "equipment", label: "Equipment", placeholder: "Mask, fins, life jackets, dive gear, camera gear...", type: "textarea" },
  { key: "safetyInformation", label: "Safety information", placeholder: "Swim ability, safety briefing, first aid, radio, oxygen kit...", type: "textarea", required: true },
  { key: "meetingPoint", label: "Meeting point", placeholder: "Harbour, dive center, beach, pickup point..." },
  { key: "operatingHours", label: "Operating hours", placeholder: "Daily 08:00-18:00", required: true },
  { key: "ageRestrictions", label: "Age restrictions", placeholder: "Minimum age, swim ability, certification level..." },
  { key: "weatherPolicy", label: "Weather cancellation policy", placeholder: "Reschedule/refund conditions..." },
  { key: "privateTrip", label: "Private trip available", placeholder: "", type: "checkbox" },
  { key: "groupTrip", label: "Group trip available", placeholder: "", type: "checkbox" },
  { key: "pickup", label: "Pickup", placeholder: "", type: "checkbox" },
  { key: "gopro", label: "GoPro option", placeholder: "", type: "checkbox" },
  { key: "drone", label: "Drone option", placeholder: "", type: "checkbox" },
  { key: "languages", label: "Languages spoken", placeholder: "Dhivehi, English, Russian..." }
];

const diningFields: OnboardingFieldDefinition[] = [
  { key: "cuisine", label: "Cuisine type", placeholder: "Maldivian, seafood, international...", required: true },
  { key: "openingHours", label: "Opening hours", placeholder: "Daily 08:00-22:30", required: true },
  { key: "seatingCapacity", label: "Seating capacity", placeholder: "Example: 35 seats" },
  { key: "averagePrice", label: "Average price range", placeholder: "USD 8-20 per person", required: true },
  { key: "menuItems", label: "Menu items", placeholder: "Breakfast, lunch, dinner, drinks...", type: "textarea", required: true },
  { key: "menuUpload", label: "Menu upload or link", placeholder: "Paste menu link, file name, or storage path" },
  { key: "delivery", label: "Delivery available", placeholder: "", type: "checkbox" },
  { key: "reservation", label: "Reservation available", placeholder: "", type: "checkbox" },
  { key: "halal", label: "Halal", placeholder: "", type: "checkbox" },
  { key: "vegetarian", label: "Vegetarian options", placeholder: "", type: "checkbox" },
  { key: "vegan", label: "Vegan options", placeholder: "", type: "checkbox" },
  { key: "cardPayment", label: "Card payment", placeholder: "", type: "checkbox" },
  { key: "featuredDishes", label: "Featured dishes", placeholder: "Tuna curry, grilled reef fish...", type: "textarea" },
  { key: "foodPhotos", label: "Food photos", placeholder: "Paste image paths or describe required photos", type: "textarea" }
];

const transferFields: OnboardingFieldDefinition[] = [
  { key: "routes", label: "Routes", placeholder: "Airport-Male-Thoddoo, Rasdhoo-Thoddoo...", type: "textarea", required: true },
  { key: "departurePoint", label: "Departure point", placeholder: "Airport jetty, Male, Thoddoo harbour", required: true },
  { key: "arrivalPoint", label: "Arrival point", placeholder: "Thoddoo harbour, airport, Male..." },
  { key: "schedule", label: "Schedule", placeholder: "Male 10:30, Thoddoo 07:00...", type: "textarea", required: true },
  { key: "oneWayPrice", label: "One-way price", placeholder: "USD 35", required: true },
  { key: "returnPrice", label: "Return price", placeholder: "USD 65" },
  { key: "childPrice", label: "Child price", placeholder: "USD 20" },
  { key: "privateCharter", label: "Private charter price", placeholder: "USD 450" },
  { key: "luggage", label: "Luggage allowance", placeholder: "20kg + hand luggage" },
  { key: "airportRep", label: "Airport representative service", placeholder: "", type: "checkbox" },
  { key: "bookingCutoff", label: "Booking cutoff time", placeholder: "Book 24h before departure" },
  { key: "cancellationPolicy", label: "Cancellation policy", placeholder: "Weather, no-show, refund terms" },
  { key: "vesselCapacity", label: "Vessel/vehicle capacity", placeholder: "28 passengers", required: true },
  { key: "pickupDropoff", label: "Pickup/drop-off", placeholder: "Hotel pickup, airport meet..." }
];

const shopFields: OnboardingFieldDefinition[] = [
  { key: "productCategories", label: "Product categories", placeholder: "Souvenirs, groceries, swimwear...", required: true },
  { key: "openingHours", label: "Opening hours", placeholder: "Daily 09:00-22:00", required: true },
  { key: "delivery", label: "Delivery", placeholder: "", type: "checkbox" },
  { key: "priceRange", label: "Price range", placeholder: "MVR 20-500", required: true },
  { key: "featuredProducts", label: "Featured products", placeholder: "Local gifts, beach items, snacks...", type: "textarea" }
];

const photographerFields: OnboardingFieldDefinition[] = [
  { key: "packages", label: "Packages", placeholder: "Couple, family, island shoot...", type: "textarea", required: true },
  { key: "duration", label: "Duration", placeholder: "1 hour, half-day...", required: true },
  { key: "photoCount", label: "Number of photos", placeholder: "50 edited photos", required: true },
  { key: "video", label: "Video option", placeholder: "", type: "checkbox" },
  { key: "drone", label: "Drone option", placeholder: "", type: "checkbox" },
  { key: "startingPrice", label: "Starting price", placeholder: "USD 120", required: true },
  { key: "deliveryTime", label: "Delivery time", placeholder: "3-5 days" },
  { key: "portfolio", label: "Portfolio", placeholder: "Website, Instagram, or sample gallery link" }
];

const wellnessFields: OnboardingFieldDefinition[] = [
  { key: "treatments", label: "Treatments", placeholder: "Massage, facial, yoga...", type: "textarea", required: true },
  { key: "duration", label: "Duration", placeholder: "60 minutes, 90 minutes", required: true },
  { key: "prices", label: "Prices", placeholder: "USD 45-100", required: true },
  { key: "bookingHours", label: "Booking hours", placeholder: "10:00-20:00", required: true },
  { key: "therapistCredentials", label: "Therapist credentials", placeholder: "License, certification, experience..." }
];

const farmFields: OnboardingFieldDefinition[] = [
  { key: "activities", label: "Activities", placeholder: "Farm walk, watermelon tasting...", type: "textarea", required: true },
  { key: "duration", label: "Duration", placeholder: "1-2 hours", required: true },
  { key: "prices", label: "Prices", placeholder: "USD 15 per person", required: true },
  { key: "seasonality", label: "Seasonal availability", placeholder: "Best months, harvest timing..." },
  { key: "maxGuests", label: "Maximum guests", placeholder: "Example: 10" },
  { key: "pickupAvailability", label: "Pickup availability", placeholder: "Property pickup, meeting point..." }
];

const guideFields: OnboardingFieldDefinition[] = [
  { key: "tourTypes", label: "Tour types", placeholder: "Food walk, island history, farm tour...", type: "textarea", required: true },
  { key: "languages", label: "Languages", placeholder: "Dhivehi, English...", required: true },
  { key: "duration", label: "Duration", placeholder: "1 hour, 3 hours...", required: true },
  { key: "prices", label: "Prices", placeholder: "USD 20 per person", required: true },
  { key: "maxGuests", label: "Maximum guests", placeholder: "Example: 8" },
  { key: "pickupAvailability", label: "Pickup availability", placeholder: "Property pickup, harbour meet..." }
];

const otherFields: OnboardingFieldDefinition[] = [
  { key: "businessDetails", label: "Business/service details", placeholder: "Explain what you offer and how visitors can book.", type: "textarea", required: true },
  { key: "openingHours", label: "Opening hours", placeholder: "Optional" },
  { key: "startingPrice", label: "Starting price", placeholder: "Optional" }
];

export const businessTypeSchemas: Record<SmartBusinessType, BusinessTypeSchema> = {
  guesthouse: {
    id: "guesthouse",
    label: "Guesthouse",
    description: "Rooms, guest policies, amenities, and stay operations.",
    schemaKind: "accommodation",
    sectionTitle: "Rooms and stay details",
    sectionDescription: "Only accommodation fields are shown for guesthouses.",
    fields: accommodationFields,
    pricing: accommodationPricing
  },
  hotel: {
    id: "hotel",
    label: "Hotel",
    description: "Accommodation with structured room and service details.",
    schemaKind: "accommodation",
    sectionTitle: "Rooms and hotel details",
    sectionDescription: "Only accommodation fields are shown for hotels.",
    fields: accommodationFields,
    pricing: accommodationPricing
  },
  watersports: {
    id: "watersports",
    label: "Watersports",
    description: "Water activities, equipment, safety, and add-ons.",
    schemaKind: "activity-service",
    sectionTitle: "Watersports services",
    sectionDescription: "Add activities, equipment, safety information, operating hours, and trip options.",
    fields: activityFields,
    pricing: activityPricing
  },
  "excursion-operator": {
    id: "excursion-operator",
    label: "Excursion Operator",
    description: "Tours, activities, inclusions, and schedules.",
    schemaKind: "activity-service",
    sectionTitle: "Excursions and inclusions",
    sectionDescription: "Add tours, durations, meeting points, inclusions, guest limits, and weather policies.",
    fields: activityFields,
    pricing: activityPricing
  },
  "dive-center": {
    id: "dive-center",
    label: "Dive Center",
    description: "Dives, certifications, equipment, and safety details.",
    schemaKind: "activity-service",
    sectionTitle: "Dive services and safety",
    sectionDescription: "Add dive services, certification requirements, equipment, safety details, and schedules.",
    fields: activityFields,
    pricing: activityPricing
  },
  restaurant: {
    id: "restaurant",
    label: "Restaurant",
    description: "Dining, menu, opening hours, and reservation details.",
    schemaKind: "dining",
    sectionTitle: "Restaurant menu and service",
    sectionDescription: "Add cuisine, menu, opening hours, seating, delivery, and dietary options.",
    fields: diningFields,
    pricing: diningPricing
  },
  cafe: {
    id: "cafe",
    label: "Cafe",
    description: "Coffee, snacks, casual dining, and menu details.",
    schemaKind: "dining",
    sectionTitle: "Cafe menu and service",
    sectionDescription: "Add menu items, drinks, opening hours, delivery, seating, and dietary options.",
    fields: diningFields,
    pricing: diningPricing
  },
  "speedboat-company": {
    id: "speedboat-company",
    label: "Speedboat Company",
    description: "Routes, schedules, fares, and vessel details.",
    schemaKind: "transfer",
    sectionTitle: "Speedboat routes and fares",
    sectionDescription: "Add routes, schedules, fares, luggage, vessel capacity, and airport support.",
    fields: transferFields,
    pricing: transferPricing
  },
  "ferry-operator": {
    id: "ferry-operator",
    label: "Ferry Operator",
    description: "Public ferry routes, schedules, and fares.",
    schemaKind: "transfer",
    sectionTitle: "Ferry routes and fares",
    sectionDescription: "Add route schedules, fare notes, luggage, capacity, and cancellation terms.",
    fields: transferFields,
    pricing: transferPricing
  },
  "transfer-company": {
    id: "transfer-company",
    label: "Transfer Company",
    description: "Private transfers, pickup, drop-off, and route pricing.",
    schemaKind: "transfer",
    sectionTitle: "Transfer routes and service details",
    sectionDescription: "Add pickup/drop-off, routes, schedules, fares, capacity, and booking cutoff details.",
    fields: transferFields,
    pricing: transferPricing
  },
  shop: {
    id: "shop",
    label: "Shop",
    description: "Products, opening hours, delivery, and price range.",
    schemaKind: "shop",
    sectionTitle: "Shop products and service",
    sectionDescription: "Add product categories, featured products, delivery details, opening hours, and price range.",
    fields: shopFields,
    pricing: shopPricing
  },
  photographer: {
    id: "photographer",
    label: "Photographer",
    description: "Packages, shoot duration, photos, video, and drone options.",
    schemaKind: "activity-service",
    sectionTitle: "Photography services",
    sectionDescription: "Add activity/service details, duration, guest limits, equipment, safety notes, meeting point, and media options.",
    fields: activityFields,
    pricing: activityPricing
  },
  wellness: {
    id: "wellness",
    label: "Wellness",
    description: "Treatments, prices, booking hours, and duration.",
    schemaKind: "wellness",
    sectionTitle: "Wellness treatments",
    sectionDescription: "Add treatments, prices, booking hours, duration, and therapist credentials.",
    fields: wellnessFields,
    pricing: wellnessPricing
  },
  "farm-experience": {
    id: "farm-experience",
    label: "Farm Experience",
    description: "Farm activities, seasonal availability, and prices.",
    schemaKind: "activity-service",
    sectionTitle: "Farm experiences",
    sectionDescription: "Add activity/service details, duration, guest limits, included items, equipment, meeting point, and weather policies.",
    fields: activityFields,
    pricing: activityPricing
  },
  "local-guide": {
    id: "local-guide",
    label: "Local Guide",
    description: "Tours, languages, duration, and prices.",
    schemaKind: "activity-service",
    sectionTitle: "Guide tours",
    sectionDescription: "Add activity/service details, duration, guest limits, included items, meeting point, operating hours, and languages.",
    fields: activityFields,
    pricing: activityPricing
  },
  other: {
    id: "other",
    label: "Other",
    description: "Any other tourism-supporting business.",
    schemaKind: "business-service",
    sectionTitle: "Business services",
    sectionDescription: "Add the specific services, availability, and pricing visitors should understand.",
    fields: otherFields,
    pricing: otherPricing
  }
};

export const businessTypeOptions: BusinessTypeOption[] = canonicalBusinessTypeOptions;

export function getBusinessTypeSchema(type: unknown) {
  return businessTypeSchemas[normalizeBusinessType(type)];
}

export function getCategoryAnswerReviewRows(type: unknown, answers: Record<string, string | boolean>) {
  const rows: Array<[string, string | boolean]> = [];

  getBusinessTypeSchema(type).fields.forEach((field) => {
    const value = answers[field.key];
    if (value !== undefined && value !== "") rows.push([field.label, value]);
  });

  return rows;
}

export function validateCategoryAnswers(type: unknown, answers: Record<string, string | boolean>) {
  return getBusinessTypeSchema(type).fields
    .filter((field) => field.required)
    .filter((field) => {
      const value = answers[field.key];
      return typeof value === "boolean" ? false : !String(value ?? "").trim();
    })
    .map((field) => `${field.label} is required.`);
}

export function validatePricingRows(type: unknown, prices: PartnerApplicationPriceInput[]) {
  const schema = getBusinessTypeSchema(type);
  const hasActivePricedRow = prices.some((price) => price.active && price.itemName.trim() && price.price.trim());
  return hasActivePricedRow ? [] : [`Add at least one active ${schema.pricing.rowLabel.toLowerCase()} with a price.`];
}

const forbiddenActivityFieldKeys = new Set([
  "roomCount",
  "roomTypes",
  "bedTypes",
  "roomCapacity",
  "breakfastIncluded",
  "amenities",
  "checkInTime",
  "checkOutTime",
  "bikiniBeachDistance",
  "roomPhotos"
]);

export function assertBusinessTypeSchemaMappings() {
  const activityTypes: SmartBusinessType[] = [
    "watersports",
    "excursion-operator",
    "dive-center",
    "farm-experience",
    "local-guide",
    "photographer"
  ];

  activityTypes.forEach((type) => {
    const schema = getBusinessTypeSchema(type);
    const definition = getBusinessTypeDefinition(type);
    if (schema.schemaKind !== "activity-service" || definition.schemaKind !== "activity-service") {
      throw new Error(`${type} must use the activity-service onboarding schema.`);
    }

    const forbiddenFields = schema.fields.filter((field) => forbiddenActivityFieldKeys.has(field.key));
    if (forbiddenFields.length > 0 || schema.pricing.defaultUnit === "per night") {
      throw new Error(`${type} contains accommodation-only fields in the onboarding schema.`);
    }
  });

  const aliases = ["Excursion", "Excursion Operator", "experience", "experiences", "Watersports", "tour-guide"];
  aliases.forEach((alias) => {
    if (getBusinessTypeSchemaKind(alias) !== "activity-service") {
      throw new Error(`${alias} must normalize to an activity-service schema.`);
    }
  });
}

assertBusinessTypeSchemaMappings();
