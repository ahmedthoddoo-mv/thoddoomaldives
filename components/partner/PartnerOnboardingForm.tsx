"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { submitSmartPartnerApplication } from "@/app/partners/onboarding/actions";
import { PricingEditor, createPricingRow } from "@/components/partner/PricingEditor";
import { membershipPlans } from "@/data/membershipPlans";
import { PartnerApplicationRepository } from "@/lib/applications/partnerApplicationRepository";
import { platformConfig } from "@/lib/config/platform";
import type { PartnerCategoryDefinition } from "@/types/partner";
import type { MembershipTier } from "@/types/membership";
import type {
  PartnerApplicationMediaInput,
  SmartBusinessType,
  SmartPartnerApplicationInput
} from "@/types/partner-smart-onboarding";
import {
  createVerificationDocuments,
  getVerificationCompletion,
  getVerificationRequirements
} from "@/types/verification-documents";

type PartnerOnboardingFormProps = {
  categories: PartnerCategoryDefinition[];
};

type FieldDefinition = {
  key: string;
  label: string;
  placeholder: string;
  type?: "text" | "textarea" | "checkbox";
  help?: string;
};

const draftKey = "ithoddoo.smart-partner-onboarding.v1";

const steps = ["Business type", "Business profile", "Services and pricing", "Media", "Membership", "Review", "Submit"];

const businessTypes: Array<{ id: SmartBusinessType; label: string; description: string }> = [
  { id: "guesthouse", label: "Guesthouse", description: "Rooms, guest policies, amenities, and stay operations." },
  { id: "hotel", label: "Hotel", description: "Accommodation with structured room and service details." },
  { id: "restaurant", label: "Restaurant", description: "Dining, menu, opening hours, and reservation details." },
  { id: "cafe", label: "Cafe", description: "Coffee, snacks, casual dining, and menu details." },
  { id: "watersports", label: "Watersports", description: "Water activities, equipment, safety, and add-ons." },
  { id: "excursion-operator", label: "Excursion Operator", description: "Tours, activities, inclusions, and schedules." },
  { id: "dive-center", label: "Dive Center", description: "Dives, certifications, equipment, and safety details." },
  { id: "speedboat-company", label: "Speedboat Company", description: "Routes, schedules, fares, and vessel details." },
  { id: "ferry-operator", label: "Ferry Operator", description: "Public ferry routes, schedules, and fares." },
  { id: "transfer-company", label: "Transfer Company", description: "Private transfers, pickup, drop-off, and route pricing." },
  { id: "shop", label: "Shop", description: "Products, opening hours, delivery, and price range." },
  { id: "photographer", label: "Photographer", description: "Packages, shoot duration, photos, video, and drone options." },
  { id: "wellness", label: "Wellness", description: "Treatments, prices, booking hours, and duration." },
  { id: "farm-experience", label: "Farm Experience", description: "Farm activities, seasonal availability, and prices." },
  { id: "local-guide", label: "Local Guide", description: "Tours, languages, duration, and prices." },
  { id: "other", label: "Other", description: "Any other tourism-supporting business." }
];

const categoryFields: Record<string, FieldDefinition[]> = {
  accommodation: [
    { key: "roomCount", label: "Number of rooms", placeholder: "Example: 8 rooms" },
    { key: "roomTypes", label: "Room types", placeholder: "Deluxe Double, Family Room, Suite", type: "textarea" },
    { key: "maxGuests", label: "Maximum guests", placeholder: "Example: 18 guests total" },
    { key: "bedType", label: "Bed type", placeholder: "Queen, twin, king, extra bed..." },
    { key: "breakfastIncluded", label: "Breakfast included", placeholder: "", type: "checkbox" },
    { key: "checkInTime", label: "Check-in time", placeholder: "14:00" },
    { key: "checkOutTime", label: "Check-out time", placeholder: "12:00" },
    { key: "amenities", label: "Amenities", placeholder: "Wi-Fi, breakfast, bicycles, beach towels...", type: "textarea" },
    { key: "childPolicy", label: "Child policy", placeholder: "Children welcome, ages, charges..." },
    { key: "extraBedPolicy", label: "Extra bed policy", placeholder: "Available on request, fee..." },
    { key: "cancellationPolicy", label: "Cancellation policy", placeholder: "Free cancellation until..." },
    { key: "airportTransfer", label: "Airport transfer availability", placeholder: "Public speedboat, private transfer..." },
    { key: "bikiniBeachDistance", label: "Bikini beach distance", placeholder: "Example: 7 minutes walk" },
    { key: "availabilityMethod", label: "Availability update method", placeholder: "WhatsApp, Google Sheet, portal..." }
  ],
  activity: [
    { key: "activities", label: "Services/activities offered", placeholder: "Snorkeling, diving, sandbank, jet ski...", type: "textarea" },
    { key: "duration", label: "Duration", placeholder: "2 hours, half-day, full-day" },
    { key: "minMaxGuests", label: "Minimum and maximum guests", placeholder: "Min 2, max 12" },
    { key: "includedItems", label: "Included items", placeholder: "Guide, water, equipment, towels...", type: "textarea" },
    { key: "equipmentIncluded", label: "Equipment included", placeholder: "Mask, fins, BCD, life jackets..." },
    { key: "safetyEquipment", label: "Safety equipment", placeholder: "Life jackets, first aid, radio..." },
    { key: "certification", label: "Certification/license details", placeholder: "PADI, dive license, operator permit..." },
    { key: "meetingPoint", label: "Meeting point", placeholder: "Harbour, property pickup, beach..." },
    { key: "operatingHours", label: "Operating hours", placeholder: "Daily 08:00-18:00" },
    { key: "ageRestrictions", label: "Age restrictions", placeholder: "Minimum age, swim ability..." },
    { key: "weatherPolicy", label: "Weather cancellation policy", placeholder: "Reschedule/refund conditions..." },
    { key: "privateTrip", label: "Private trip available", placeholder: "", type: "checkbox" },
    { key: "groupTrip", label: "Group trip available", placeholder: "", type: "checkbox" },
    { key: "photoVideo", label: "Photo/video add-ons", placeholder: "Photo package, video package..." },
    { key: "gopro", label: "GoPro option", placeholder: "", type: "checkbox" },
    { key: "drone", label: "Drone option", placeholder: "", type: "checkbox" },
    { key: "pickupIncluded", label: "Pickup included", placeholder: "", type: "checkbox" },
    { key: "languages", label: "Languages spoken", placeholder: "Dhivehi, English, Russian..." }
  ],
  dining: [
    { key: "cuisine", label: "Cuisine type", placeholder: "Maldivian, seafood, international..." },
    { key: "openingHours", label: "Opening hours", placeholder: "Daily 08:00-22:30" },
    { key: "menuUpload", label: "Menu upload/metadata", placeholder: "Paste menu link or note file name" },
    { key: "averagePrice", label: "Average price range", placeholder: "USD 8-20 per person" },
    { key: "delivery", label: "Delivery available", placeholder: "", type: "checkbox" },
    { key: "reservation", label: "Reservation available", placeholder: "", type: "checkbox" },
    { key: "seatingCapacity", label: "Seating capacity", placeholder: "Example: 35 seats" },
    { key: "halal", label: "Halal", placeholder: "", type: "checkbox" },
    { key: "vegetarian", label: "Vegetarian options", placeholder: "", type: "checkbox" },
    { key: "vegan", label: "Vegan options", placeholder: "", type: "checkbox" },
    { key: "cardPayment", label: "Card payment", placeholder: "", type: "checkbox" },
    { key: "location", label: "Location", placeholder: "Main road, harbour, beach route..." },
    { key: "featuredDishes", label: "Featured dishes", placeholder: "Tuna curry, grilled reef fish...", type: "textarea" },
    { key: "diningPhotos", label: "Photos", placeholder: "Paste paths or describe photos", type: "textarea" }
  ],
  transfer: [
    { key: "routes", label: "Routes", placeholder: "Airport-Male-Thoddoo, Rasdhoo-Thoddoo...", type: "textarea" },
    { key: "departurePoints", label: "Departure points", placeholder: "Airport jetty, Male, Thoddoo harbour" },
    { key: "arrivalPoints", label: "Arrival points", placeholder: "Thoddoo harbour, airport..." },
    { key: "schedule", label: "Schedule", placeholder: "Male 10:30, Thoddoo 07:00...", type: "textarea" },
    { key: "oneWayPrice", label: "One-way price", placeholder: "USD 35" },
    { key: "returnPrice", label: "Return price", placeholder: "USD 65" },
    { key: "childPrice", label: "Child price", placeholder: "USD 20" },
    { key: "privateCharter", label: "Private charter price", placeholder: "USD 450" },
    { key: "luggage", label: "Luggage allowance", placeholder: "20kg + hand luggage" },
    { key: "airportRep", label: "Airport representative service", placeholder: "", type: "checkbox" },
    { key: "bookingCutoff", label: "Booking cutoff time", placeholder: "Book 24h before departure" },
    { key: "cancellationPolicy", label: "Cancellation policy", placeholder: "Weather, no-show, refund terms" },
    { key: "vesselCapacity", label: "Vessel capacity", placeholder: "28 passengers" },
    { key: "transferContact", label: "Contact person", placeholder: "Operations manager name" },
    { key: "pickupDropoff", label: "Pickup/drop-off options", placeholder: "Hotel pickup, airport meet..." }
  ],
  shop: [
    { key: "productCategories", label: "Product categories", placeholder: "Souvenirs, groceries, swimwear..." },
    { key: "openingHours", label: "Opening hours", placeholder: "Daily 09:00-22:00" },
    { key: "delivery", label: "Delivery", placeholder: "", type: "checkbox" },
    { key: "priceRange", label: "Price range", placeholder: "MVR 20-500" }
  ],
  photographer: [
    { key: "packages", label: "Packages", placeholder: "Couple, family, resort day shoot", type: "textarea" },
    { key: "duration", label: "Duration", placeholder: "1 hour, half-day..." },
    { key: "photoCount", label: "Photo count", placeholder: "50 edited photos" },
    { key: "drone", label: "Drone option", placeholder: "", type: "checkbox" },
    { key: "video", label: "Video option", placeholder: "", type: "checkbox" },
    { key: "startingPrice", label: "Starting price", placeholder: "USD 120" }
  ],
  wellness: [
    { key: "treatments", label: "Treatments", placeholder: "Massage, facial, yoga...", type: "textarea" },
    { key: "duration", label: "Duration", placeholder: "60 minutes, 90 minutes" },
    { key: "prices", label: "Prices", placeholder: "USD 45-100" },
    { key: "bookingHours", label: "Booking hours", placeholder: "10:00-20:00" }
  ],
  farm: [
    { key: "activities", label: "Activities", placeholder: "Farm walk, watermelon tasting...", type: "textarea" },
    { key: "duration", label: "Duration", placeholder: "1-2 hours" },
    { key: "prices", label: "Prices", placeholder: "USD 15 per person" },
    { key: "seasonality", label: "Seasonal availability", placeholder: "Best months, harvest timing..." }
  ],
  guide: [
    { key: "tourTypes", label: "Tour types", placeholder: "Food walk, island history, farm tour...", type: "textarea" },
    { key: "languages", label: "Languages", placeholder: "Dhivehi, English..." },
    { key: "duration", label: "Duration", placeholder: "1 hour, 3 hours..." },
    { key: "prices", label: "Prices", placeholder: "USD 20 per person" }
  ],
  other: [
    { key: "businessDetails", label: "Business/service details", placeholder: "Explain what you offer and how visitors can book.", type: "textarea" },
    { key: "openingHours", label: "Opening hours", placeholder: "Optional" },
    { key: "startingPrice", label: "Starting price", placeholder: "Optional" }
  ]
};

function createInitialMedia(): PartnerApplicationMediaInput[] {
  return [
    { id: "logo", mediaType: "logo", label: "Logo", pathOrNote: "", fileName: "" },
    { id: "cover", mediaType: "cover", label: "Cover image", pathOrNote: "", fileName: "" },
    { id: "gallery", mediaType: "gallery", label: "Gallery images", pathOrNote: "", fileName: "" },
    { id: "menu", mediaType: "menu", label: "Menu", pathOrNote: "", fileName: "" },
    { id: "price-list", mediaType: "price_list", label: "Price list", pathOrNote: "", fileName: "" },
    { id: "schedule", mediaType: "schedule", label: "Schedule document", pathOrNote: "", fileName: "" },
    { id: "license", mediaType: "license", label: "License document", pathOrNote: "", fileName: "" }
  ];
}

function createInitialApplication(): SmartPartnerApplicationInput {
  return {
    businessType: "guesthouse",
    businessName: "",
    contactPerson: "",
    whatsapp: "",
    email: "",
    island: "Thoddoo",
    address: "",
    googleMapsLink: "",
    website: "",
    instagram: "",
    facebook: "",
    shortDescription: "",
    registrationNumber: "",
    membershipPlan: "verified",
    notes: "",
    categoryAnswers: {},
    prices: [createPricingRow()],
    media: createInitialMedia(),
    verificationDocuments: createVerificationDocuments("guesthouse"),
    antiSpamAnswer: ""
  };
}

function getCategoryKey(type: SmartBusinessType) {
  if (type === "guesthouse" || type === "hotel") return "accommodation";
  if (type === "restaurant" || type === "cafe") return "dining";
  if (type === "watersports" || type === "excursion-operator" || type === "dive-center") return "activity";
  if (type === "speedboat-company" || type === "ferry-operator" || type === "transfer-company") return "transfer";
  if (type === "shop") return "shop";
  if (type === "photographer") return "photographer";
  if (type === "wellness") return "wellness";
  if (type === "farm-experience") return "farm";
  if (type === "local-guide") return "guide";
  return "other";
}

function formatValue(value: string | boolean) {
  return typeof value === "boolean" ? (value ? "Yes" : "No") : value || "Not provided";
}

function buildMockApplication(input: SmartPartnerApplicationInput) {
  return {
    businessName: input.businessName,
    businessType: input.businessType === "transfer-company" ? "speedboat-company" : input.businessType,
    contactPerson: input.contactPerson,
    whatsappNumber: input.whatsapp,
    email: input.email,
    island: input.island,
    address: input.address,
    shortDescription: input.shortDescription,
    servicesOffered: input.prices.map((price) => `${price.itemName} ${price.currency} ${price.price}`).join(", "),
    serviceCount: String(input.prices.length),
    priceRange: input.prices.map((price) => `${price.currency} ${price.price}`).filter(Boolean).join(", "),
    websiteOrSocial: [input.website, input.instagram, input.facebook].filter(Boolean).join(" · "),
    photoNotes: input.media.map((media) => `${media.label}: ${media.pathOrNote || media.fileName}`).filter(Boolean).join("\n"),
    membershipInterest: input.membershipPlan,
    rooms: String(input.categoryAnswers.roomCount ?? ""),
    checkInOut: [input.categoryAnswers.checkInTime, input.categoryAnswers.checkOutTime].filter(Boolean).join(" / "),
    amenities: String(input.categoryAnswers.amenities ?? ""),
    cuisine: String(input.categoryAnswers.cuisine ?? ""),
    openingHours: String(input.categoryAnswers.openingHours ?? ""),
    menuNotes: String(input.categoryAnswers.menuUpload ?? ""),
    boatName: "",
    capacity: String(input.categoryAnswers.vesselCapacity ?? input.categoryAnswers.minMaxGuests ?? ""),
    departureTimes: String(input.categoryAnswers.schedule ?? ""),
    airportTransferSupport: String(input.categoryAnswers.airportRep ?? input.categoryAnswers.airportTransfer ?? ""),
    activityType: String(input.categoryAnswers.activities ?? input.categoryAnswers.tourTypes ?? ""),
    duration: String(input.categoryAnswers.duration ?? ""),
    includedItems: String(input.categoryAnswers.includedItems ?? ""),
    notes: input.notes
  };
}

export function PartnerOnboardingForm(_props: PartnerOnboardingFormProps) {
  const [application, setApplication] = useState<SmartPartnerApplicationInput>(() => createInitialApplication());
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [reference, setReference] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState("");
  const [isPending, startTransition] = useTransition();
  const categoryKey = getCategoryKey(application.businessType);
  const fields = categoryFields[categoryKey];

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (raw) setApplication({ ...createInitialApplication(), ...JSON.parse(raw) });
    } catch {
      // Draft restore is best-effort only.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(draftKey, JSON.stringify(application));
  }, [application]);

  function updateApplication(updates: Partial<SmartPartnerApplicationInput>) {
    setApplication((current) => ({ ...current, ...updates }));
  }

  function updateCategoryAnswer(key: string, value: string | boolean) {
    setApplication((current) => ({
      ...current,
      categoryAnswers: {
        ...current.categoryAnswers,
        [key]: value
      }
    }));
  }

  function changeBusinessType(type: SmartBusinessType) {
    setApplication((current) => ({
      ...current,
      businessType: type,
      categoryAnswers: {},
      verificationDocuments: createVerificationDocuments(type)
    }));
  }

  function validateStep(step: number) {
    const nextErrors: string[] = [];
    if (step >= 1) {
      if (!application.businessName.trim()) nextErrors.push("Business name is required.");
      if (!application.contactPerson.trim()) nextErrors.push("Owner/contact person is required.");
      if (application.whatsapp.replace(/\D/g, "").length < 7) nextErrors.push("A valid WhatsApp number is required.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(application.email.trim())) nextErrors.push("A valid email is required.");
      if (!application.shortDescription.trim()) nextErrors.push("Short business description is required.");
    }
    if (step >= 2 && !application.prices.some((price) => price.itemName.trim() && price.active)) {
      nextErrors.push("Add at least one active pricing row.");
    }
    if (step >= 3) {
      const missingDocuments = getVerificationRequirements(application.businessType)
        .filter((requirement) => requirement.required)
        .filter((requirement) => {
          const document = application.verificationDocuments.find((item) => item.key === requirement.key);
          return !document || (!document.fileName.trim() && !document.storagePathOrNote.trim());
        });

      if (missingDocuments.length > 0) {
        nextErrors.push(`Required verification documents missing: ${missingDocuments.map((document) => document.label).join(", ")}.`);
      }
    }
    setErrors(nextErrors);
    return nextErrors.length === 0;
  }

  function goNext() {
    if (validateStep(currentStep)) setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  }

  function submitApplication() {
    if (!validateStep(5)) return;
    setErrors([]);
    startTransition(async () => {
      const result = await submitSmartPartnerApplication(application);
      if (result.mode === "mock") {
        const saved = PartnerApplicationRepository.createFromOnboarding(buildMockApplication(application) as never);
        setReference(saved.id);
        setWhatsappUrl(`https://wa.me/${platformConfig.whatsappNumbers.partnerships.replace(/\D/g, "")}`);
        setCurrentStep(6);
        return;
      }
      if (!result.ok) {
        setErrors(result.errors ?? [result.message]);
        return;
      }
      setReference(result.reference ?? "");
      setWhatsappUrl(result.whatsappUrl ?? "");
      setDuplicateWarning(result.duplicateWarning ?? "");
      window.localStorage.removeItem(draftKey);
      setCurrentStep(6);
    });
  }

  const reviewRows = useMemo(
    () => [
      ["Business type", businessTypes.find((type) => type.id === application.businessType)?.label ?? application.businessType],
      ["Business name", application.businessName],
      ["Owner/contact", application.contactPerson],
      ["WhatsApp", application.whatsapp],
      ["Email", application.email],
      ["Island", application.island],
      ["Address", application.address],
      ["Membership", application.membershipPlan],
      ["Description", application.shortDescription],
      ...Object.entries(application.categoryAnswers).map(([key, value]) => [key, formatValue(value)]),
      ["Pricing rows", String(application.prices.length)],
      ["Media metadata", application.media.filter((media) => media.pathOrNote || media.fileName).map((media) => media.label).join(", ") || "None yet"],
      ["Verification completion", `${getVerificationCompletion(application.verificationDocuments)}%`],
      [
        "Verification documents",
        application.verificationDocuments
          .filter((document) => document.fileName || document.storagePathOrNote)
          .map((document) => document.label)
          .join(", ") || "None yet"
      ]
    ],
    [application]
  );

  return (
    <section className="smartOnboarding">
      <ol className="onboardingSteps" aria-label="Partner application progress">
        {steps.map((step, index) => (
          <li className={index <= currentStep ? "onboardingStep onboardingStepComplete" : "onboardingStep"} key={step}>
            <span>{index + 1}</span>
            {step}
          </li>
        ))}
      </ol>

      {errors.length > 0 ? (
        <div className="bookingValidationPanel" role="alert">
          <strong>Please fix these details</strong>
          <ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul>
        </div>
      ) : null}

      {currentStep === 0 ? (
        <div className="onboardingCard">
          <div className="sectionHeader">
            <p className="eyebrow">Step 1</p>
            <h2>Choose business type</h2>
            <p>The form will only show questions relevant to the selected category.</p>
          </div>
          <div className="businessTypeGrid">
            {businessTypes.map((type) => (
              <button className={application.businessType === type.id ? "businessTypeCard businessTypeCardActive" : "businessTypeCard"} key={type.id} onClick={() => changeBusinessType(type.id)} type="button">
                <strong>{type.label}</strong>
                <span>{type.description}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {currentStep === 1 ? (
        <div className="onboardingCard">
          <div className="sectionHeader">
            <p className="eyebrow">Step 2</p>
            <h2>Business profile</h2>
          </div>
          <div className="onboardingGrid">
            <label><span>Business name</span><input value={application.businessName} onChange={(event) => updateApplication({ businessName: event.target.value })} /></label>
            <label><span>Owner/contact person</span><input value={application.contactPerson} onChange={(event) => updateApplication({ contactPerson: event.target.value })} /></label>
            <label><span>WhatsApp</span><input value={application.whatsapp} onChange={(event) => updateApplication({ whatsapp: event.target.value })} placeholder="+960 914 2538" /></label>
            <label><span>Email</span><input type="email" value={application.email} onChange={(event) => updateApplication({ email: event.target.value })} /></label>
            <label><span>Island</span><input value={application.island} onChange={(event) => updateApplication({ island: event.target.value })} /></label>
            <label><span>Address</span><input value={application.address} onChange={(event) => updateApplication({ address: event.target.value })} /></label>
            <label><span>Google Maps link</span><input value={application.googleMapsLink} onChange={(event) => updateApplication({ googleMapsLink: event.target.value })} /></label>
            <label><span>Website</span><input value={application.website} onChange={(event) => updateApplication({ website: event.target.value })} /></label>
            <label><span>Instagram</span><input value={application.instagram} onChange={(event) => updateApplication({ instagram: event.target.value })} /></label>
            <label><span>Facebook</span><input value={application.facebook} onChange={(event) => updateApplication({ facebook: event.target.value })} /></label>
            <label><span>Registration/license number</span><input value={application.registrationNumber} onChange={(event) => updateApplication({ registrationNumber: event.target.value })} /></label>
            <label className="onboardingWide"><span>Short business description</span><textarea value={application.shortDescription} onChange={(event) => updateApplication({ shortDescription: event.target.value })} /></label>
          </div>
        </div>
      ) : null}

      {currentStep === 2 ? (
        <div className="onboardingCard">
          <div className="sectionHeader">
            <p className="eyebrow">Step 3</p>
            <h2>Services and pricing</h2>
            <p>{categoryKey === "accommodation" ? "Accommodation fields are visible only for guesthouses and hotels." : "Accommodation questions are hidden for this business type."}</p>
          </div>
          <div className="onboardingGrid">
            {fields.map((field) => (
              <label className={field.type === "textarea" ? "onboardingWide" : ""} key={field.key}>
                <span>{field.label}</span>
                {field.type === "checkbox" ? (
                  <input checked={Boolean(application.categoryAnswers[field.key])} onChange={(event) => updateCategoryAnswer(field.key, event.target.checked)} type="checkbox" />
                ) : field.type === "textarea" ? (
                  <textarea value={String(application.categoryAnswers[field.key] ?? "")} onChange={(event) => updateCategoryAnswer(field.key, event.target.value)} placeholder={field.placeholder} />
                ) : (
                  <input value={String(application.categoryAnswers[field.key] ?? "")} onChange={(event) => updateCategoryAnswer(field.key, event.target.value)} placeholder={field.placeholder} />
                )}
                {field.help ? <small>{field.help}</small> : null}
              </label>
            ))}
          </div>
          <PricingEditor rows={application.prices} onChange={(prices) => updateApplication({ prices })} />
        </div>
      ) : null}

      {currentStep === 3 ? (
        <div className="onboardingCard">
          <div className="sectionHeader">
            <p className="eyebrow">Step 4</p>
            <h2>Media metadata</h2>
            <p>Real upload is not enabled yet. Add links, existing file paths, or notes. This saves metadata only.</p>
          </div>
          <div className="onboardingGrid">
            {application.media.map((media) => (
              <label key={media.id}>
                <span>{media.label}</span>
                <input value={media.pathOrNote} onChange={(event) => updateApplication({ media: application.media.map((item) => item.id === media.id ? { ...item, pathOrNote: event.target.value } : item) })} placeholder="Path, public link, or note" />
              </label>
            ))}
          </div>
          <div className="verificationChecklistPanel">
            <div className="sectionHeader">
              <p className="eyebrow">Private verification</p>
              <h3>Required documents</h3>
              <p>
                Verification documents are stored as private records for admin review. Use a private storage path,
                secure link, or file name placeholder until direct upload is connected.
              </p>
            </div>
            <div className="verificationCompletionBar" aria-label="Verification document completion">
              <span style={{ width: `${getVerificationCompletion(application.verificationDocuments)}%` }} />
            </div>
            <p className="mutedText">{getVerificationCompletion(application.verificationDocuments)}% complete</p>
            <div className="verificationDocumentGrid">
              {application.verificationDocuments.map((document) => (
                <div className="verificationDocumentCard" key={document.key}>
                  <div>
                    <strong>{document.label}</strong>
                    <span>{document.required ? "Required" : "Optional / where applicable"}</span>
                  </div>
                  <label>
                    File name
                    <input
                      value={document.fileName}
                      onChange={(event) =>
                        updateApplication({
                          verificationDocuments: application.verificationDocuments.map((item) =>
                            item.key === document.key ? { ...item, fileName: event.target.value, status: event.target.value ? "submitted" : "missing" } : item
                          )
                        })
                      }
                      placeholder="license.pdf"
                    />
                  </label>
                  <label>
                    Private storage path or note
                    <input
                      value={document.storagePathOrNote}
                      onChange={(event) =>
                        updateApplication({
                          verificationDocuments: application.verificationDocuments.map((item) =>
                            item.key === document.key
                              ? { ...item, storagePathOrNote: event.target.value, status: event.target.value ? "submitted" : "missing" }
                              : item
                          )
                        })
                      }
                      placeholder="partner-verification-documents/business/license.pdf"
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {currentStep === 4 ? (
        <div className="onboardingCard">
          <div className="sectionHeader">
            <p className="eyebrow">Step 5</p>
            <h2>Membership</h2>
          </div>
          <div className="membershipCardGrid">
            {membershipPlans.map((plan) => (
              <label className={application.membershipPlan === plan.tier ? "membershipChoice membershipChoiceActive" : "membershipChoice"} key={plan.tier}>
                <input checked={application.membershipPlan === plan.tier} onChange={() => updateApplication({ membershipPlan: plan.tier })} type="radio" />
                <strong>{plan.name}</strong>
                <span>{plan.description}</span>
              </label>
            ))}
          </div>
          <label className="onboardingWide onboardingSoloField">
            <span>Notes</span>
            <textarea value={application.notes} onChange={(event) => updateApplication({ notes: event.target.value })} />
          </label>
          <label className="onboardingSoloField">
            <span>Anti-spam: what is 3 + 5?</span>
            <input value={application.antiSpamAnswer} onChange={(event) => updateApplication({ antiSpamAnswer: event.target.value })} />
          </label>
        </div>
      ) : null}

      {currentStep === 5 ? (
        <div className="onboardingCard">
          <div className="sectionHeader">
            <p className="eyebrow">Step 6</p>
            <h2>Review before submit</h2>
          </div>
          <div className="reviewGrid">
            {reviewRows.map(([label, value]) => (
              <div className="reviewItem" key={label}>
                <span>{label}</span>
                <strong>{value || "Not provided"}</strong>
              </div>
            ))}
          </div>
          <button className="adminContentAddButton adminContentSecondaryButton" type="button" onClick={() => window.print()}>
            Print summary
          </button>
        </div>
      ) : null}

      {currentStep === 6 ? (
        <div className="onboardingCard">
          <div className="sectionHeader">
            <p className="eyebrow">Submitted</p>
            <h2>Application submitted successfully</h2>
            <p>{reference ? `Reference: ${reference}` : "Your application has been saved."}</p>
            {duplicateWarning ? <p className="mutedText">{duplicateWarning}</p> : null}
          </div>
          <div className="onboardingActions">
            {whatsappUrl ? (
              <a className="adminContentAddButton" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                Continue to WhatsApp
              </a>
            ) : null}
            <a className="adminContentAddButton adminContentSecondaryButton" href="/partners">
              Back to partner program
            </a>
          </div>
        </div>
      ) : null}

      {currentStep < 6 ? (
        <div className="onboardingActions">
          <button disabled={currentStep === 0} type="button" onClick={() => setCurrentStep((step) => Math.max(step - 1, 0))}>Back</button>
          {currentStep < 5 ? (
            <button type="button" onClick={goNext}>Next</button>
          ) : (
            <button disabled={isPending} type="button" onClick={submitApplication}>{isPending ? "Submitting..." : "Submit application"}</button>
          )}
          <a href={`https://wa.me/${platformConfig.whatsappNumbers.partnerships.replace(/\D/g, "")}?text=${encodeURIComponent("Hi, I need help with the iThoddoo Growth Partner application.")}`} target="_blank" rel="noopener noreferrer">
            Need help?
          </a>
        </div>
      ) : null}
    </section>
  );
}
