"use client";

import { defaultPartnerApplications } from "@/data/partnerApplications";
import type { AdminManagedProperty } from "@/data/adminContent";
import { saveAdminProperty } from "@/lib/properties/propertyStore";
import { createPropertySlug } from "@/lib/properties/propertySlug";
import type { PartnerOnboardingApplication } from "@/types/partner-onboarding";
import type {
  ApplicationDecisionResult,
  PartnerApplicationBusinessType,
  PartnerApplicationFilters,
  PartnerApplicationListingWorkflow,
  PartnerApplicationRecord,
  PartnerApplicationStatus,
  PartnerApplicationTimelineEvent
} from "@/types/partner-application";

const STORAGE_KEY = "ithoddoo.demo.partner-applications.v1";
const CRM_EVENT_KEY = "ithoddoo.demo.crm-application-events.v1";
const STORE_EVENT = "ithoddoo:partner-applications-changed";

const fallbackHeroImage = "/images/hero-thoddoo.jpg";

function isBrowser() {
  return typeof window !== "undefined";
}

function nowIso() {
  return new Date().toISOString();
}

function emitStoreChange() {
  if (isBrowser()) {
    window.dispatchEvent(new Event(STORE_EVENT));
  }
}

function createId(prefix: string, seed: string) {
  return `${prefix}-${createPropertySlug(seed)}-${Date.now().toString(36)}`;
}

function createTimelineEvent(
  applicationId: string,
  type: PartnerApplicationTimelineEvent["type"],
  label: string,
  detail: string,
  actor = "Admin"
): PartnerApplicationTimelineEvent {
  return {
    id: `${applicationId}-${type}-${Date.now().toString(36)}`,
    type,
    label,
    detail,
    date: nowIso(),
    actor
  };
}

function isApplicationLike(value: unknown): value is PartnerApplicationRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const application = value as Partial<PartnerApplicationRecord>;
  return Boolean(application.id && application.businessName && application.businessType && application.status);
}

function readStoredApplications(): PartnerApplicationRecord[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isApplicationLike) : [];
  } catch {
    return [];
  }
}

function dedupeApplications(applications: PartnerApplicationRecord[]) {
  const byId = new Map<string, PartnerApplicationRecord>();
  applications.forEach((application) => byId.set(application.id, application));
  return Array.from(byId.values());
}

function writeStoredApplications(applications: PartnerApplicationRecord[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dedupeApplications(applications)));
  emitStoreChange();
}

function appendCrmEvent(application: PartnerApplicationRecord, event: PartnerApplicationTimelineEvent) {
  if (!isBrowser()) {
    return;
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(CRM_EVENT_KEY) ?? "[]");
    const existing = Array.isArray(parsed) ? parsed : [];
    window.localStorage.setItem(
      CRM_EVENT_KEY,
      JSON.stringify([
        {
          id: event.id,
          partnerId: application.linkedPartnerId ?? `lead-${application.id}`,
          partnerBusiness: application.businessName,
          type: event.type,
          label: event.label,
          detail: event.detail,
          date: event.date
        },
        ...existing
      ])
    );
  } catch {
    // Demo CRM events are non-critical and should never block the review flow.
  }
}

function normalizeBusinessType(value: string): PartnerApplicationBusinessType {
  if (value === "tour-guide") {
    return "local-guide";
  }

  if (value === "wellness-spa") {
    return "wellness";
  }

  if (value === "taxi-service") {
    return "speedboat-company";
  }

  const allowed: PartnerApplicationBusinessType[] = [
    "guesthouse",
    "hotel",
    "restaurant",
    "cafe",
    "speedboat-company",
    "ferry-operator",
    "excursion-operator",
    "dive-center",
    "watersports",
    "shop",
    "photographer",
    "wellness",
    "farm-experience",
    "local-guide",
    "other"
  ];

  return allowed.includes(value as PartnerApplicationBusinessType)
    ? (value as PartnerApplicationBusinessType)
    : "other";
}

function getListingWorkflow(businessType: PartnerApplicationBusinessType): PartnerApplicationListingWorkflow {
  if (businessType === "guesthouse" || businessType === "hotel") {
    return "property";
  }

  if (businessType === "restaurant" || businessType === "cafe") {
    return "restaurant";
  }

  if (businessType === "speedboat-company" || businessType === "ferry-operator") {
    return "transfer";
  }

  if (["excursion-operator", "dive-center", "watersports", "local-guide", "farm-experience"].includes(businessType)) {
    return "experience";
  }

  return "business";
}

function upsertApplication(updatedApplication: PartnerApplicationRecord) {
  const storedApplications = readStoredApplications();
  const nextStoredApplications = storedApplications.some((application) => application.id === updatedApplication.id)
    ? storedApplications.map((application) => (application.id === updatedApplication.id ? updatedApplication : application))
    : [...storedApplications, updatedApplication];

  writeStoredApplications(nextStoredApplications);
  return updatedApplication;
}

function updateWithTimeline(
  id: string,
  updates: Partial<PartnerApplicationRecord>,
  timelineEvent?: PartnerApplicationTimelineEvent
): ApplicationDecisionResult | undefined {
  const application = PartnerApplicationRepository.findById(id);

  if (!application) {
    return undefined;
  }

  const updatedApplication: PartnerApplicationRecord = {
    ...application,
    ...updates,
    updatedDate: nowIso(),
    timeline: timelineEvent ? [timelineEvent, ...application.timeline] : application.timeline
  };

  const savedApplication = upsertApplication(updatedApplication);
  if (timelineEvent) {
    appendCrmEvent(savedApplication, timelineEvent);
  }

  return {
    application: savedApplication,
    message: timelineEvent?.label ?? "Application updated"
  };
}

function createDraftProperty(application: PartnerApplicationRecord, publish: boolean): AdminManagedProperty {
  const slug = createPropertySlug(application.businessName);
  const startingPrice = application.services.match(/\$?\d+[\d,.]*/)?.[0] ?? "$90";
  const roomLabel = application.businessType === "hotel" ? "Standard Room" : "Demo Room";

  return {
    id: application.linkedListingId ?? `property-${slug}`,
    name: application.businessName,
    slug,
    island: application.island,
    address: application.address,
    logo:
      application.businessName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "IT",
    coverImage: fallbackHeroImage,
    gallery: [fallbackHeroImage, "/images/homepage/hero-1.jpg"],
    description: application.description,
    shortDescription: application.description,
    fullDescription: `${application.description}\n\nServices: ${application.services}`,
    roomTypes: [{ name: roomLabel, price: `From ${startingPrice}`, capacity: "2 guests" }],
    amenities: application.services
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 6),
    policies: ["Policies to be confirmed during listing review"],
    checkIn: "14:00",
    checkOut: "12:00",
    whatsapp: application.whatsapp,
    email: application.email,
    website: application.websiteOrSocial,
    googleMaps: application.address,
    googleMapsLink: `https://maps.google.com/?q=${encodeURIComponent(application.businessName + " " + application.island)}`,
    gpsLocation: "Pending",
    membershipPlan:
      application.requestedMembershipTier === "premium"
        ? "Premium"
        : application.requestedMembershipTier === "verified"
          ? "Verified"
          : "Free",
    verificationStatus: application.verificationStatus === "verified" ? "Verified" : "Pending",
    isPublished: publish,
    isFeatured: false,
    isArchived: false,
    seo: {
      title: `${application.businessName} | iThoddoo Maldives`,
      description: application.description,
      slug
    },
    updated: "Just now"
  };
}

export const PartnerApplicationRepository = {
  findAll() {
    return dedupeApplications([...defaultPartnerApplications, ...readStoredApplications()]).sort(
      (a, b) => new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime()
    );
  },

  findById(id: string) {
    return this.findAll().find((application) => application.id === id);
  },

  findByStatus(status: PartnerApplicationStatus) {
    return this.findAll().filter((application) => application.status === status);
  },

  findByBusinessType(businessType: PartnerApplicationBusinessType) {
    return this.findAll().filter((application) => application.businessType === businessType);
  },

  search(query: string) {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return this.findAll();
    }

    return this.findAll().filter((application) =>
      [
        application.businessName,
        application.contactPerson,
        application.email,
        application.whatsapp,
        application.businessType,
        application.status
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  },

  filter(filters: PartnerApplicationFilters) {
    return this.search(filters.search)
      .filter((application) => filters.status === "all" || application.status === filters.status)
      .filter((application) => filters.businessType === "all" || application.businessType === filters.businessType)
      .filter((application) => filters.membershipTier === "all" || application.requestedMembershipTier === filters.membershipTier)
      .sort((a, b) => {
        const left = new Date(a.submittedDate).getTime();
        const right = new Date(b.submittedDate).getTime();
        return filters.sort === "newest" ? right - left : left - right;
      });
  },

  create(application: PartnerApplicationRecord) {
    const savedApplication = upsertApplication(application);
    appendCrmEvent(savedApplication, savedApplication.timeline[0]);
    return savedApplication;
  },

  createFromOnboarding(onboardingApplication: PartnerOnboardingApplication) {
    const businessType = normalizeBusinessType(onboardingApplication.businessType);
    const id = createId("app", onboardingApplication.businessName);
    const event = createTimelineEvent(
      id,
      "submitted",
      "Application submitted",
      "Partner application submitted from the public onboarding form.",
      "Partner"
    );
    const application: PartnerApplicationRecord = {
      id,
      businessName: onboardingApplication.businessName,
      businessType,
      contactPerson: onboardingApplication.contactPerson,
      whatsapp: onboardingApplication.whatsappNumber,
      email: onboardingApplication.email,
      island: onboardingApplication.island,
      address: onboardingApplication.address,
      description: onboardingApplication.shortDescription,
      services: onboardingApplication.servicesOffered,
      websiteOrSocial: onboardingApplication.websiteOrSocial,
      requestedMembershipTier: onboardingApplication.membershipInterest,
      mediaNotes: onboardingApplication.photoNotes,
      submittedDate: nowIso(),
      updatedDate: nowIso(),
      status: "submitted",
      assignedReviewer: "Unassigned",
      adminNotes: onboardingApplication.notes ? [onboardingApplication.notes] : [],
      requestedChanges: [],
      listingWorkflow: getListingWorkflow(businessType),
      listingPublicationStatus: "draft",
      verificationStatus: "unverified",
      timeline: [event]
    };

    return this.create(application);
  },

  update(id: string, updates: Partial<PartnerApplicationRecord>) {
    return updateWithTimeline(id, updates)?.application;
  },

  startReview(id: string, reviewer: string) {
    const event = createTimelineEvent(id, "review_started", "Review started", `Assigned to ${reviewer}.`);
    return updateWithTimeline(id, { status: "under_review", assignedReviewer: reviewer }, event);
  },

  approve(id: string, publishListing = false) {
    const application = this.findById(id);

    if (!application) {
      return undefined;
    }

    const partnerId = application.linkedPartnerId ?? `partner-${createPropertySlug(application.businessName)}`;
    const listingId =
      application.linkedListingId ??
      `${application.listingWorkflow === "property" ? "property" : application.listingWorkflow}-${createPropertySlug(application.businessName)}`;
    const updates: Partial<PartnerApplicationRecord> = {
      status: "approved",
      linkedPartnerId: partnerId,
      linkedListingId: listingId,
      verificationStatus: "verified",
      listingPublicationStatus: publishListing ? "published" : "draft"
    };
    const event = createTimelineEvent(
      id,
      "approved",
      "Application approved",
      publishListing
        ? "Partner record created and listing published by explicit admin action."
        : "Partner record created and listing kept as draft for separate publication."
    );
    const result = updateWithTimeline(id, updates, event);

    if (result?.application.listingWorkflow === "property") {
      saveAdminProperty(createDraftProperty(result.application, publishListing));
      appendCrmEvent(
        result.application,
        createTimelineEvent(
          id,
          "listing_created",
          publishListing ? "Listing published" : "Listing drafted",
          publishListing ? "Approved application created a published property listing." : "Approved application created a draft property listing."
        )
      );
    }

    return result;
  },

  reject(id: string, note: string) {
    const event = createTimelineEvent(id, "rejected", "Application rejected", note || "Application rejected by admin.");
    return updateWithTimeline(id, { status: "rejected", verificationStatus: "rejected", adminNotes: [note].filter(Boolean) }, event);
  },

  requestChanges(id: string, changes: string[], note: string) {
    const application = this.findById(id);
    const event = createTimelineEvent(
      id,
      "changes_requested",
      "Changes requested",
      [...changes, note].filter(Boolean).join(" · ")
    );

    return updateWithTimeline(
      id,
      {
        status: "changes_requested",
        requestedChanges: changes,
        adminNotes: [...(application?.adminNotes ?? []), note].filter(Boolean)
      },
      event
    );
  },

  resubmit(id: string, partnerNote: string) {
    const application = this.findById(id);
    const event = createTimelineEvent(
      id,
      "resubmitted",
      "Application resubmitted",
      partnerNote || "Partner resubmitted the requested changes.",
      "Partner"
    );

    return updateWithTimeline(
      id,
      {
        status: "submitted",
        requestedChanges: [],
        adminNotes: [...(application?.adminNotes ?? []), partnerNote].filter(Boolean)
      },
      event
    );
  },

  reopen(id: string) {
    const event = createTimelineEvent(id, "reopened", "Application reopened", "Application returned to the review queue.");
    return updateWithTimeline(id, { status: "under_review" }, event);
  },

  linkPartner(id: string, partnerId: string) {
    return this.update(id, { linkedPartnerId: partnerId });
  },

  linkListing(id: string, listingId: string) {
    return this.update(id, { linkedListingId: listingId });
  },

  resetDemoData() {
    if (!isBrowser()) {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(CRM_EVENT_KEY);
    emitStoreChange();
  }
};

export function readApplicationCrmEvents() {
  if (!isBrowser()) {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(CRM_EVENT_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function subscribeToPartnerApplications(callback: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  window.addEventListener(STORE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(STORE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
