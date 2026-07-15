"use server";

import { platformConfig } from "@/lib/config/platform";
import { validateCategoryAnswers, validatePricingRows } from "@/lib/partner-onboarding/onboardingSchemas";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getDataMode } from "@/lib/supabase/status";
import type { PartnerApplicationRecord, PartnerApplicationBusinessType } from "@/types/partner-application";
import type { SmartPartnerApplicationInput } from "@/types/partner-smart-onboarding";
import { getVerificationCompletion, getVerificationRequirements } from "@/types/verification-documents";

export type SmartPartnerApplicationResult = {
  ok: boolean;
  mode: "mock" | "supabase";
  message: string;
  errors?: string[];
  reference?: string;
  application?: PartnerApplicationRecord;
  whatsappUrl?: string;
  duplicateWarning?: string;
};

const allowedBusinessTypes: PartnerApplicationBusinessType[] = [
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

const submissionAttempts = new Map<string, number[]>();
const submissionWindowMs = 10 * 60 * 1000;
const submissionLimit = 5;

function sanitizeText(value: string, maxLength = 1200) {
  return value.replace(/[<>]/g, "").trim().slice(0, maxLength);
}

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, "");
}

function normalizeBusinessType(value: string): PartnerApplicationBusinessType {
  if (value === "transfer-company") return "speedboat-company";
  return allowedBusinessTypes.includes(value as PartnerApplicationBusinessType)
    ? (value as PartnerApplicationBusinessType)
    : "other";
}

function logSupabaseWriteError(stage: string, error: unknown) {
  const safeError =
    error && typeof error === "object"
      ? {
          code: "code" in error ? String((error as { code?: unknown }).code ?? "") : undefined,
          message: "message" in error ? String((error as { message?: unknown }).message ?? "") : "Unknown write failure"
        }
      : { message: "Unknown write failure" };

  console.error("[partner-onboarding-submit]", { stage, ...safeError });
}

function getListingWorkflow(type: PartnerApplicationBusinessType): PartnerApplicationRecord["listingWorkflow"] {
  if (type === "guesthouse" || type === "hotel") return "property";
  if (type === "restaurant" || type === "cafe") return "restaurant";
  if (type === "speedboat-company" || type === "ferry-operator") return "transfer";
  if (["excursion-operator", "dive-center", "watersports", "farm-experience", "local-guide"].includes(type)) return "experience";
  return "business";
}

function validateApplication(input: SmartPartnerApplicationInput) {
  const errors: string[] = [];

  if (input.antiSpamAnswer.trim() !== "8") errors.push("Anti-spam answer is incorrect.");
  if (!sanitizeText(input.businessName, 160)) errors.push("Business name is required.");
  if (!sanitizeText(input.contactPerson, 160)) errors.push("Owner/contact person is required.");
  if (normalizePhone(input.whatsapp).replace(/\D/g, "").length < 7) errors.push("A valid WhatsApp number is required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) errors.push("A valid email is required.");
  if (!sanitizeText(input.island, 80)) errors.push("Island is required.");
  if (!sanitizeText(input.shortDescription, 800)) errors.push("Short business description is required.");
  if (!sanitizeText(input.fullDescription, 2000)) errors.push("Full business description is required.");
  errors.push(...validateCategoryAnswers(input.businessType, input.categoryAnswers));
  errors.push(...validatePricingRows(input.businessType, input.prices));
  const requiredDocuments = getVerificationRequirements(input.businessType).filter((document) => document.required);
  const missingDocuments = requiredDocuments.filter((requirement) => {
    const document = input.verificationDocuments.find((item) => item.key === requirement.key);
    return !document || (!document.fileName.trim() && !document.storagePathOrNote.trim());
  });
  if (missingDocuments.length > 0) {
    errors.push(`Required verification documents missing: ${missingDocuments.map((document) => document.label).join(", ")}.`);
  }

  return errors;
}

function checkSubmissionRateLimit(input: SmartPartnerApplicationInput) {
  const key = `${input.email.trim().toLowerCase()}-${normalizePhone(input.whatsapp).replace(/\D/g, "")}`;
  const now = Date.now();
  const recentAttempts = (submissionAttempts.get(key) ?? []).filter((timestamp) => now - timestamp < submissionWindowMs);

  if (recentAttempts.length >= submissionLimit) {
    return false;
  }

  submissionAttempts.set(key, [...recentAttempts, now]);
  return true;
}

async function createApplicationReference(db: any) {
  const year = new Date().getFullYear();
  const { count, error } = await db
    .from("partner_applications")
    .select("id", { count: "exact", head: true })
    .gte("submitted_at", `${year}-01-01T00:00:00.000Z`);

  if (error) throw error;
  return `ITM-APP-${year}-${String((count ?? 0) + 1).padStart(6, "0")}`;
}

function buildApplicationSummary(input: SmartPartnerApplicationInput, reference: string) {
  const priceLines = input.prices
    .filter((price) => price.itemName.trim())
    .map((price) => `- ${price.itemName}: ${price.currency} ${price.price || "TBC"} ${price.unit}`)
    .join("\n");

  return [
    "New Growth Partner Application",
    `Reference: ${reference}`,
    "",
    `Business: ${input.businessName}`,
    `Type: ${input.businessType}`,
    `Owner/contact: ${input.contactPerson}`,
    `WhatsApp: ${input.whatsapp}`,
    `Email: ${input.email}`,
    `Island: ${input.island}`,
    `Membership: ${input.membershipPlan}`,
    "",
    `Short description: ${input.shortDescription}`,
    `Full description: ${input.fullDescription}`,
    "",
    "Pricing/services:",
    priceLines || "No pricing rows",
    "",
    `Notes: ${input.notes || "None"}`
  ].join("\n");
}

function mapSavedApplication(row: any, input: SmartPartnerApplicationInput): PartnerApplicationRecord {
  const businessType = normalizeBusinessType(input.businessType);
  const timelineDate = row.submitted_at ?? new Date().toISOString();

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
    services: input.prices.map((price) => `${price.itemName} ${price.currency} ${price.price} ${price.unit}`).join(", "),
    websiteOrSocial: [row.website, row.instagram, row.facebook].filter(Boolean).join(" · "),
    requestedMembershipTier: row.membership_plan,
    mediaNotes: input.media.map((media) => `${media.label}: ${media.pathOrNote || media.fileName || "metadata only"}`).join("\n"),
    submittedDate: timelineDate,
    updatedDate: row.updated_at ?? timelineDate,
    status: row.status,
    assignedReviewer: "Unassigned",
    adminNotes: row.notes ? [row.notes] : [],
    requestedChanges: row.missing_information ?? [],
    listingWorkflow: getListingWorkflow(businessType),
    listingPublicationStatus: "draft",
    verificationStatus: "pending",
    verificationDocuments: input.verificationDocuments,
    verificationCompletion: getVerificationCompletion(input.verificationDocuments),
    timeline: [
      {
        id: `${row.id}-submitted`,
        type: "submitted",
        label: "Application submitted",
        detail: `Reference ${row.application_reference} submitted from smart onboarding.`,
        date: timelineDate,
        actor: "Partner"
      }
    ]
  };
}

export async function submitSmartPartnerApplication(input: SmartPartnerApplicationInput): Promise<SmartPartnerApplicationResult> {
  if (getDataMode() !== "supabase") {
    return {
      ok: false,
      mode: "mock",
      message: "Mock mode is active. Application can be saved in browser demo storage."
    };
  }

  const errors = validateApplication(input);
  if (errors.length > 0) {
    return { ok: false, mode: "supabase", message: "Please fix the application details.", errors };
  }

  if (!checkSubmissionRateLimit(input)) {
    return {
      ok: false,
      mode: "supabase",
      message: "Too many submission attempts.",
      errors: ["Please wait a few minutes before submitting again."]
    };
  }

  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return {
      ok: false,
      mode: "supabase",
      message: "Supabase service role is not configured.",
      errors: ["Application could not be saved. Please contact iThoddoo Maldives."]
    };
  }

  const db = supabase as any;
  const businessType = normalizeBusinessType(input.businessType);
  let reference = "";
  try {
    reference = await createApplicationReference(db);
  } catch (error) {
    logSupabaseWriteError("create_application_reference", error);
    return {
      ok: false,
      mode: "supabase",
      message: "Application reference could not be created.",
      errors: ["Please try again or contact iThoddoo Maldives."]
    };
  }
  const normalizedWhatsapp = normalizePhone(input.whatsapp);

  const { data: duplicate, error: duplicateError } = await db
    .from("partner_applications")
    .select("id, business_name")
    .or(`business_name.ilike.%${sanitizeText(input.businessName, 80)}%,email.eq.${input.email.trim()},whatsapp.eq.${normalizedWhatsapp}`)
    .limit(1)
    .maybeSingle();

  if (duplicateError) {
    logSupabaseWriteError("duplicate_check", duplicateError);
  }

  const metadata = {
    googleMapsLink: sanitizeText(input.googleMapsLink, 600),
    registrationNumber: sanitizeText(input.registrationNumber, 160),
    fullDescription: sanitizeText(input.fullDescription, 2400),
    categoryAnswers: input.categoryAnswers,
    verificationCompletion: getVerificationCompletion(input.verificationDocuments),
    source: "smart_partner_onboarding"
  };
  const now = new Date().toISOString();

  const { data: applicationRow, error: applicationError } = await db
    .from("partner_applications")
    .insert({
      application_reference: reference,
      business_name: sanitizeText(input.businessName, 180),
      business_type: businessType,
      contact_person: sanitizeText(input.contactPerson, 180),
      whatsapp: normalizedWhatsapp,
      email: input.email.trim().toLowerCase(),
      island: sanitizeText(input.island, 80),
      address: sanitizeText(input.address, 300),
      google_maps_link: sanitizeText(input.googleMapsLink, 600),
      website: sanitizeText(input.website, 300),
      instagram: sanitizeText(input.instagram, 300),
      facebook: sanitizeText(input.facebook, 300),
      short_description: sanitizeText(input.shortDescription, 1000),
      registration_number: sanitizeText(input.registrationNumber, 160),
      membership_plan: input.membershipPlan,
      status: "submitted",
      metadata,
      notes: sanitizeText(input.notes, 1200),
      missing_information: [],
      review_notes: [],
      submitted_at: now,
      updated_at: now
    })
    .select("*")
    .single();

  if (applicationError || !applicationRow) {
    logSupabaseWriteError("partner_applications_insert", applicationError);
    return {
      ok: false,
      mode: "supabase",
      message: "Application could not be saved.",
      errors: ["Please try again or contact iThoddoo Maldives."]
    };
  }

  async function failAfterPartialWrite(stage: string, error: unknown, message: string): Promise<SmartPartnerApplicationResult> {
    logSupabaseWriteError(stage, error);
    const rollback = await db.from("partner_applications").delete().eq("id", applicationRow.id);
    if (rollback.error) logSupabaseWriteError(`${stage}_rollback`, rollback.error);
    return {
      ok: false,
      mode: "supabase",
      message,
      errors: ["The application was not completed. Please try again or contact iThoddoo Maldives."]
    };
  }

  const activePrices = input.prices.filter((price) => price.itemName.trim());
  if (activePrices.length > 0) {
    const { error: pricesError } = await db.from("partner_application_prices").insert(
      activePrices.map((price, index) => ({
        application_id: applicationRow.id,
        item_name: sanitizeText(price.itemName, 180),
        description: sanitizeText(price.description, 600),
        price: price.price ? Number(price.price) : null,
        currency: price.currency,
        unit: price.unit,
        child_price: price.childPrice ? Number(price.childPrice) : null,
        notes: sanitizeText(price.notes, 600),
        active: price.active,
        sort_order: index
      }))
    );
    if (pricesError) return failAfterPartialWrite("partner_application_prices_insert", pricesError, "Pricing could not be saved.");
  }

  const mediaRows = input.media.filter((media) => media.pathOrNote.trim() || media.fileName.trim());
  if (mediaRows.length > 0) {
    const { error: mediaError } = await db.from("partner_application_media").insert(
      mediaRows.map((media, index) => ({
        application_id: applicationRow.id,
        media_type: media.mediaType,
        label: sanitizeText(media.label, 160),
        path_or_note: sanitizeText(media.pathOrNote, 700),
        file_name: sanitizeText(media.fileName, 240),
        status: "metadata_only",
        sort_order: index
      }))
    );
    if (mediaError) return failAfterPartialWrite("partner_application_media_insert", mediaError, "Media metadata could not be saved.");
  }

  const serviceRows = Object.entries(input.categoryAnswers).filter(([, value]) => String(value).trim());
  if (serviceRows.length > 0) {
    const { error: serviceError } = await db.from("partner_application_services").insert(
      serviceRows.map(([key, value], index) => ({
        application_id: applicationRow.id,
        service_type: businessType,
        title: key,
        details: String(value),
        sort_order: index
      }))
    );
    if (serviceError) return failAfterPartialWrite("partner_application_services_insert", serviceError, "Service answers could not be saved.");
  }

  const verificationDocumentRows = input.verificationDocuments.map((document) => ({
    application_id: applicationRow.id,
    document_key: document.key,
    document_label: sanitizeText(document.label, 180),
    required: document.required,
    storage_bucket: "partner-verification-documents",
    storage_path: sanitizeText(document.storagePathOrNote, 700) || null,
    file_name: sanitizeText(document.fileName, 240) || null,
    status: document.fileName.trim() || document.storagePathOrNote.trim() ? "submitted" : "missing"
  }));

  if (verificationDocumentRows.length > 0) {
    const { error: verificationError } = await db.from("partner_application_verification_documents").upsert(
      verificationDocumentRows,
      { onConflict: "application_id,document_key" }
    );
    if (verificationError) {
      return failAfterPartialWrite(
        "partner_application_verification_documents_upsert",
        verificationError,
        "Verification documents could not be saved."
      );
    }
  }

  const crmNoteResult = await db.from("crm_notes").insert({
    author: "Partner Onboarding",
    body: `Application ${reference} submitted by ${input.businessName}. Duplicate check: ${duplicate?.business_name ?? "none found"}.`
  });
  if (crmNoteResult.error) logSupabaseWriteError("crm_notes_insert", crmNoteResult.error);

  const crmTaskResult = await db.from("crm_tasks").insert({
    title: `Review ${reference}`,
    task_type: "Review Application",
    owner: "Admin",
    due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    status: "open",
    priority: "high"
  });
  if (crmTaskResult.error) logSupabaseWriteError("crm_tasks_insert", crmTaskResult.error);

  const summary = buildApplicationSummary(input, reference);
  const officialWhatsapp = platformConfig.whatsappNumbers.partnerships.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${officialWhatsapp}?text=${encodeURIComponent(summary)}`;

  return {
    ok: true,
    mode: "supabase",
    message: `Application ${reference} submitted successfully.`,
    reference,
    application: mapSavedApplication(applicationRow, input),
    whatsappUrl,
    duplicateWarning: duplicate ? `Possible duplicate found: ${duplicate.business_name}` : undefined
  };
}
