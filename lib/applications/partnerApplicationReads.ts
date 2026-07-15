import { defaultPartnerApplications } from "@/data/partnerApplications";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getDataMode } from "@/lib/supabase/status";
import type { MembershipTier } from "@/types/membership";
import type {
  PartnerApplicationBusinessType,
  PartnerApplicationListingWorkflow,
  PartnerApplicationRecord,
  PartnerApplicationStatus
} from "@/types/partner-application";
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
  membership_plan: string;
  status: string;
  notes: string | null;
  missing_information: string[] | null;
  review_notes: string[] | null;
  submitted_at: string;
  updated_at: string;
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
  application_id: string;
  label: string;
  path_or_note: string | null;
  file_name: string | null;
  sort_order: number;
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

const businessTypes: PartnerApplicationBusinessType[] = [
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

function normalizeBusinessType(value: string): PartnerApplicationBusinessType {
  return businessTypes.includes(value as PartnerApplicationBusinessType)
    ? (value as PartnerApplicationBusinessType)
    : "other";
}

function normalizeStatus(value: string): PartnerApplicationStatus {
  return applicationStatuses.includes(value as PartnerApplicationStatus)
    ? (value as PartnerApplicationStatus)
    : "submitted";
}

function normalizeMembership(value: string): MembershipTier {
  return membershipTiers.includes(value as MembershipTier) ? (value as MembershipTier) : "verified";
}

function getListingWorkflow(type: PartnerApplicationBusinessType): PartnerApplicationListingWorkflow {
  if (type === "guesthouse" || type === "hotel") return "property";
  if (type === "restaurant" || type === "cafe") return "restaurant";
  if (type === "speedboat-company" || type === "ferry-operator") return "transfer";
  if (["excursion-operator", "dive-center", "watersports", "farm-experience", "local-guide"].includes(type)) {
    return "experience";
  }
  return "business";
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
  verificationDocuments: PartnerApplicationVerificationDocumentRow[]
): PartnerApplicationRecord {
  const businessType = normalizeBusinessType(row.business_type);
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
    assignedReviewer: "Unassigned",
    adminNotes: [...(row.review_notes ?? []), row.notes].filter(Boolean) as string[],
    requestedChanges: row.missing_information ?? [],
    listingWorkflow: getListingWorkflow(businessType),
    listingPublicationStatus: "draft",
    verificationStatus: row.status === "approved" ? "verified" : "pending",
    verificationDocuments: documentRecords,
    verificationCompletion: getVerificationCompletion(documentRecords),
    timeline: [
      {
        id: `${row.id}-submitted`,
        type: "submitted",
        label: "Application submitted",
        detail: `Supabase application ${row.application_reference ?? row.id} received from smart onboarding.`,
        date: row.submitted_at,
        actor: "Partner"
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
    const db = supabase as any;
    const { data: applicationRows, error: applicationError } = await db
      .from("partner_applications")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (applicationError) throw applicationError;
    const applications = (applicationRows ?? []) as PartnerApplicationRow[];
    const applicationIds = applications.map((application) => application.id);

    if (applicationIds.length === 0) {
      return { applications: [], source: "supabase" };
    }

    async function readChildRows<T>(table: string) {
      const result = await db.from(table).select("*").in("application_id", applicationIds);
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

    const [prices, media, services, verificationDocuments] = await Promise.all([
      readChildRows<PartnerApplicationPriceRow>("partner_application_prices"),
      readChildRows<PartnerApplicationMediaRow>("partner_application_media"),
      readChildRows<PartnerApplicationServiceRow>("partner_application_services"),
      readChildRows<PartnerApplicationVerificationDocumentRow>("partner_application_verification_documents")
    ]);

    return {
      applications: applications.map((application) =>
        mapApplication(
          application,
          byApplicationId(prices, application.id),
          byApplicationId(media, application.id),
          byApplicationId(services, application.id),
          verificationDocuments.filter((document) => document.application_id === application.id)
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
