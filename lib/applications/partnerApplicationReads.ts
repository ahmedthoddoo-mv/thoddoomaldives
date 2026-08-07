import { defaultPartnerApplications } from "@/data/partnerApplications";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getDataMode } from "@/lib/supabase/status";
import type { MembershipTier } from "@/types/membership";
import type {
  PartnerApplicationBusinessType,
  PartnerApplicationListingWorkflow,
  PartnerApplicationRecord,
  PartnerApplicationStatus,
  PartnerApplicationWorkflowSource
} from "@/types/partner-application";
import { getBusinessTypeListingWorkflow, normalizeBusinessType } from "@/types/business-type";
import type { PartnerVerificationDocumentInput, VerificationDocumentStatus } from "@/types/verification-documents";
import { getVerificationCompletion } from "@/types/verification-documents";

type PartnerApplicationReadResult = {
  applications: PartnerApplicationRecord[];
  source: "mock" | "supabase" | "supabase_error";
  error?: string;
};

type PartnerApplicationRow = {
  id: string;
  application_reference: string | null;
  business_name: string;
  business_type: string;
  contact_person: string;
  whatsapp: string;
  email: string;
  island: string;
  address: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  short_description: string;
  google_maps_link: string | null;
  registration_number: string | null;
  metadata: unknown;
  membership_plan: string;
  status: string;
  notes: string | null;
  missing_information: string[] | null;
  review_notes: string[] | null;
  submitted_at: string;
  updated_at: string;
  partner_id: string | null;
  property_id: string | null;
  listing_id?: string | null;
  listing_type?: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
};

type PropertyPublicationRow = {
  id: string;
  publication_status: string;
};

type ListingPublicationRow = {
  id: string;
  publication_status: string;
};

type PartnerLinkRow = {
  id: string;
  business_name: string;
};

type PartnerApplicationPriceRow = {
  application_id: string;
  item_name: string;
  price: number | null;
  currency: string;
  unit: string;
  active: boolean;
  sort_order: number;
};

type PartnerApplicationMediaRow = {
  id: string;
  application_id: string;
  label: string;
  path_or_note: string | null;
  file_name: string | null;
  sort_order: number;
  media_type: string;
  status: string;
  public_selected?: boolean;
  admin_rights_confirmed?: boolean;
};

type PartnerApplicationServiceRow = {
  application_id: string;
  title: string;
  details: string | null;
  sort_order: number;
};

type PartnerApplicationVerificationDocumentRow = {
  application_id: string;
  document_key: string;
  document_label: string;
  required: boolean;
  storage_path: string | null;
  file_name: string | null;
  status: string;
  updated_at: string;
};

type PartnerApplicationReviewVersionRow = {
  id: string;
  application_id: string;
  version: number;
  edited_by_name: string;
  edited_at: string;
};

const applicationStatuses: PartnerApplicationStatus[] = [
  "draft",
  "submitted",
  "under_review",
  "changes_requested",
  "approved",
  "rejected",
  "withdrawn"
];

const membershipTiers: MembershipTier[] = ["free", "verified", "premium"];

function normalizeStatus(value: string): PartnerApplicationStatus {
  return applicationStatuses.includes(value as PartnerApplicationStatus)
    ? (value as PartnerApplicationStatus)
    : "submitted";
}

function normalizeMembership(value: string): MembershipTier {
  return membershipTiers.includes(value as MembershipTier) ? (value as MembershipTier) : "verified";
}

function getListingWorkflow(type: PartnerApplicationBusinessType): PartnerApplicationListingWorkflow {
  return getBusinessTypeListingWorkflow(type);
}

function getWorkflowSource(metadata: unknown): PartnerApplicationWorkflowSource {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return "partner_submitted";
  }

  const source = "workflowSource" in metadata ? metadata.workflowSource : "source" in metadata ? metadata.source : null;
  return source === "admin_created" ? "admin_created" : "partner_submitted";
}

function byApplicationId<T extends { application_id: string; sort_order: number }>(rows: T[], applicationId: string) {
  return rows
    .filter((row) => row.application_id === applicationId)
    .sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0));
}

function mapApplication(
  row: PartnerApplicationRow,
  prices: PartnerApplicationPriceRow[],
  media: PartnerApplicationMediaRow[],
  services: PartnerApplicationServiceRow[],
  verificationDocuments: PartnerApplicationVerificationDocumentRow[],
  reviewVersions: PartnerApplicationReviewVersionRow[],
  publicationStatus: string | undefined,
  linkedPartnerName?: string
): PartnerApplicationRecord {
  const businessType = normalizeBusinessType(row.business_type);
  const source = getWorkflowSource(row.metadata);
  const metadata = row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
    ? row.metadata as {
        fullDescription?: unknown;
        categoryAnswers?: Record<string, unknown>;
        registrationNumber?: unknown;
        adminReview?: { category?: Record<string, unknown>; verificationNotes?: unknown; editedAt?: unknown; editedBy?: unknown };
      }
    : {};
  const priceSummary = prices
    .filter((price) => price.active)
    .map((price) => `${price.item_name}${price.price ? ` ${price.currency} ${price.price}` : ""} ${price.unit}`.trim())
    .join(", ");
  const serviceSummary = services.map((service) => `${service.title}: ${service.details ?? ""}`.trim()).join(", ");
  const mediaNotes = media
    .map((item) => `${item.label}: ${item.path_or_note || item.file_name || "metadata only"}`)
    .join("\n");
  const documentRecords: PartnerVerificationDocumentInput[] = verificationDocuments.map((document) => ({
    key: document.document_key as PartnerVerificationDocumentInput["key"],
    label: document.document_label,
    required: document.required,
    fileName: document.file_name ?? "",
    storagePathOrNote: document.storage_path ?? "",
    status: ["missing", "submitted", "approved", "rejected", "more_required"].includes(document.status)
      ? (document.status as VerificationDocumentStatus)
      : "submitted"
  }));

  return {
    id: row.id,
    businessName: row.business_name,
    businessType,
    source,
    contactPerson: row.contact_person,
    whatsapp: row.whatsapp,
    email: row.email,
    island: row.island,
    address: row.address ?? "",
    description: row.short_description,
    services: [priceSummary, serviceSummary].filter(Boolean).join(" · ") || "No services submitted yet.",
    websiteOrSocial: [row.website, row.instagram, row.facebook].filter(Boolean).join(" · "),
    requestedMembershipTier: normalizeMembership(row.membership_plan),
    mediaNotes,
    submittedDate: row.submitted_at,
    updatedDate: row.updated_at,
    status: normalizeStatus(row.status),
    assignedReviewer: row.reviewed_by ?? "Unassigned",
    adminNotes: [...(row.review_notes ?? []), row.notes].filter(Boolean) as string[],
    requestedChanges: row.missing_information ?? [],
    listingWorkflow: getListingWorkflow(businessType),
    linkedPartnerId: row.partner_id ?? undefined,
    linkedPartnerName,
    linkedListingId: row.listing_id ?? row.property_id ?? undefined,
    listingPublicationStatus: publicationStatus
      && ["draft", "pending", "published", "archived"].includes(publicationStatus)
      ? publicationStatus as PartnerApplicationRecord["listingPublicationStatus"]
      : "draft",
    verificationStatus: row.status === "approved" ? "verified" : "pending",
    verificationDocuments: documentRecords,
    verificationCompletion: getVerificationCompletion(documentRecords),
    submittedFields: [
      { label: "Google Maps", value: row.google_maps_link ?? "" },
      { label: "Registration / licence", value: row.registration_number ?? String(metadata.registrationNumber ?? "") },
      { label: "Full description", value: String(metadata.fullDescription ?? "") },
      ...Object.entries(metadata.categoryAnswers ?? {}).map(([label, value]) => ({ label, value: String(value) }))
    ].filter((field) => field.value.trim()),
    pricingRows: prices.filter((price) => price.active).map((price) => ({
      name: price.item_name,
      price: price.price && price.price > 0 ? `${price.currency} ${price.price}` : "Price on request",
      unit: price.unit
    })),
    publicMedia: media
      .filter((item) => !["license", "verification", "registration"].includes(item.media_type))
      .map((item) => ({ id: item.id, label: item.label, status: item.status, selected: Boolean(item.public_selected), rightsConfirmed: Boolean(item.admin_rights_confirmed) })),
    reviewValues: {
      common: {
        businessName: row.business_name,
        contactPerson: row.contact_person,
        whatsapp: row.whatsapp,
        email: row.email,
        website: row.website ?? "",
        island: row.island,
        address: row.address ?? "",
        googleMaps: row.google_maps_link ?? "",
        shortDescription: row.short_description,
        fullDescription: String(metadata.fullDescription ?? ""),
        membership: row.membership_plan
      },
      category: Object.fromEntries(Object.entries(metadata.adminReview?.category ?? metadata.categoryAnswers ?? {}).map(([key, value]) => [key, String(value ?? "")])),
      prices: prices.filter((price) => price.active).map((price) => ({ name: price.item_name, price: price.price === null ? "" : String(price.price), currency: price.currency, unit: price.unit })),
      verificationNotes: String(metadata.adminReview?.verificationNotes ?? ""),
      publicMediaIds: media.filter((item) => item.public_selected).map((item) => item.id),
      mediaRightsConfirmed: media.some((item) => item.admin_rights_confirmed),
      editedAt: metadata.adminReview?.editedAt ? String(metadata.adminReview.editedAt) : undefined,
      editedBy: metadata.adminReview?.editedBy ? String(metadata.adminReview.editedBy) : undefined
    },
    timeline: [
      ...reviewVersions.map((version) => ({
        id: version.id,
        type: "note" as const,
        label: `Reviewed values saved (version ${version.version})`,
        detail: "A versioned correction snapshot was saved before approval.",
        date: version.edited_at,
        actor: version.edited_by_name
      })),
      {
        id: `${row.id}-submitted`,
        type: "submitted",
        label: source === "admin_created" ? "Admin workflow created" : "Application submitted",
        detail: source === "admin_created"
          ? `Supabase application ${row.application_reference ?? row.id} was created from the admin business workflow.`
          : `Supabase application ${row.application_reference ?? row.id} received from smart onboarding.`,
        date: row.submitted_at,
        actor: source === "admin_created" ? "Admin" : "Partner"
      }
    ]
  };
}

export async function getPartnerApplicationsForAdmin(): Promise<PartnerApplicationReadResult> {
  if (getDataMode() !== "supabase") {
    return { applications: defaultPartnerApplications, source: "mock" };
  }

  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return {
      applications: [],
      source: "supabase_error",
      error: "Supabase service role is not configured."
    };
  }

  try {
    const db = supabase;
    const { data: applicationRows, error: applicationError } = await db
      .from("partner_applications")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (applicationError) throw applicationError;
    const applications = (applicationRows ?? []) as PartnerApplicationRow[];
    const applicationIds = applications.map((application) => application.id);
    const propertyIds = applications
      .map((application) => application.property_id)
      .filter((propertyId): propertyId is string => Boolean(propertyId));
    const partnerIds = applications
      .map((application) => application.partner_id)
      .filter((partnerId): partnerId is string => Boolean(partnerId));
    const listingIdsByWorkflow = applications.reduce<Record<PartnerApplicationListingWorkflow, string[]>>(
      (accumulator, application) => {
        const workflow = getListingWorkflow(normalizeBusinessType(application.business_type));
        const listingId = application.listing_id ?? application.property_id;
        if (listingId && workflow !== "business") {
          accumulator[workflow].push(listingId);
        }
        return accumulator;
      },
      { property: [], restaurant: [], transfer: [], experience: [], business: [] }
    );

    if (applicationIds.length === 0) {
      return { applications: [], source: "supabase" };
    }

    const [
      priceResult,
      mediaResult,
      serviceResult,
      verificationResult,
      reviewVersionResult,
      propertyResult,
      restaurantResult,
      experienceResult,
      transferResult,
      partnerResult
    ] = await Promise.all([
      db.from("partner_application_prices").select("*").in("application_id", applicationIds),
      db.from("partner_application_media").select("*").in("application_id", applicationIds),
      db.from("partner_application_services").select("*").in("application_id", applicationIds),
      db.from("partner_application_verification_documents").select("*").in("application_id", applicationIds),
      db.from("partner_application_review_versions").select("id, application_id, version, edited_by_name, edited_at").in("application_id", applicationIds).order("version", { ascending: false }),
      propertyIds.length > 0
        ? db.from("properties").select("id, publication_status").in("id", propertyIds)
        : Promise.resolve({ data: [], error: null }),
      listingIdsByWorkflow.restaurant.length > 0
        ? db.from("restaurants").select("id, publication_status").in("id", listingIdsByWorkflow.restaurant)
        : Promise.resolve({ data: [], error: null }),
      listingIdsByWorkflow.experience.length > 0
        ? db.from("experiences").select("id, publication_status").in("id", listingIdsByWorkflow.experience)
        : Promise.resolve({ data: [], error: null }),
      listingIdsByWorkflow.transfer.length > 0
        ? db.from("transfers").select("id, publication_status").in("id", listingIdsByWorkflow.transfer)
        : Promise.resolve({ data: [], error: null }),
      partnerIds.length > 0
        ? db.from("partners").select("id, business_name").in("id", partnerIds)
        : Promise.resolve({ data: [], error: null })
    ]);

    function readResultRows<T>(
      table: string,
      result: { data: unknown[] | null; error: { code?: string; message: string } | null }
    ) {
      if (result.error) {
        console.error("[admin-applications-read]", {
          table,
          code: result.error.code,
          message: result.error.message
        });
        return [] as T[];
      }
      return (result.data ?? []) as T[];
    }

    const prices = readResultRows<PartnerApplicationPriceRow>("partner_application_prices", priceResult);
    const media = readResultRows<PartnerApplicationMediaRow>("partner_application_media", mediaResult);
    const services = readResultRows<PartnerApplicationServiceRow>("partner_application_services", serviceResult);
    const verificationDocuments = readResultRows<PartnerApplicationVerificationDocumentRow>(
      "partner_application_verification_documents",
      verificationResult
    );
    const reviewVersions = readResultRows<PartnerApplicationReviewVersionRow>("partner_application_review_versions", reviewVersionResult);
    const properties = readResultRows<PropertyPublicationRow>("properties", propertyResult);
    const restaurants = readResultRows<ListingPublicationRow>("restaurants", restaurantResult);
    const experiences = readResultRows<ListingPublicationRow>("experiences", experienceResult);
    const transfers = readResultRows<ListingPublicationRow>("transfers", transferResult);
    const partners = readResultRows<PartnerLinkRow>("partners", partnerResult);
    const publicationStatusByListingId = new Map<string, string>([
      ...properties.map((property) => [property.id, property.publication_status] as const),
      ...restaurants.map((listing) => [listing.id, listing.publication_status] as const),
      ...experiences.map((listing) => [listing.id, listing.publication_status] as const),
      ...transfers.map((listing) => [listing.id, listing.publication_status] as const)
    ]);
    const partnerNameById = new Map(
      partners.map((partner) => [partner.id, partner.business_name])
    );

    return {
      applications: applications.map((application) =>
        mapApplication(
          application,
          byApplicationId(prices, application.id),
          byApplicationId(media, application.id),
          byApplicationId(services, application.id),
          verificationDocuments.filter((document) => document.application_id === application.id),
          reviewVersions.filter((version) => version.application_id === application.id),
          publicationStatusByListingId.get(application.listing_id ?? application.property_id ?? ""),
          application.partner_id ? partnerNameById.get(application.partner_id) : undefined
        )
      ),
      source: "supabase"
    };
  } catch (error) {
    console.error("[admin-applications-read]", {
      table: "partner_applications",
      message: error instanceof Error ? error.message : "Unknown Supabase read failure"
    });
    return {
      applications: [],
      source: "supabase_error",
      error: error instanceof Error ? error.message : "Supabase applications could not be loaded."
    };
  }
}
