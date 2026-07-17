"use server";

import { revalidatePath } from "next/cache";
import { hasAdminDemoSession } from "@/lib/admin/adminAuth";
import { createPropertySlug } from "@/lib/properties/propertySlug";
import { logPartnerAuditEvent } from "@/lib/partner-portal/partnerAuth";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getDataMode } from "@/lib/supabase/status";
import type { PartnerApplicationStatus } from "@/types/partner-application";

export type AdminApplicationDecisionAction =
  | "mark_under_review"
  | "approve_draft"
  | "approve_publish"
  | "request_changes"
  | "reject"
  | "reopen";

export type AdminApplicationDecisionInput = {
  applicationId: string;
  action: AdminApplicationDecisionAction;
  reviewer: string;
  note: string;
  requestedChanges: string[];
};

export type AdminApplicationDecisionResult = {
  ok: boolean;
  message: string;
  status?: PartnerApplicationStatus;
  requestedChanges?: string[];
  linkedPartnerId?: string;
};

function sanitizeText(value: string, maxLength = 1200) {
  return value.replace(/[<>]/g, "").trim().slice(0, maxLength);
}

function getDecisionStatus(action: AdminApplicationDecisionAction): PartnerApplicationStatus {
  if (action === "mark_under_review" || action === "reopen") return "under_review";
  if (action === "approve_draft" || action === "approve_publish") return "approved";
  if (action === "request_changes") return "changes_requested";
  if (action === "reject") return "rejected";
  return "submitted";
}

function getDecisionMessage(action: AdminApplicationDecisionAction) {
  if (action === "mark_under_review") return "Review marked under review";
  if (action === "approve_draft") return "Application approved. Listing remains draft.";
  if (action === "approve_publish") return "Application approved and published.";
  if (action === "request_changes") return "Changes requested";
  if (action === "reject") return "Application rejected";
  return "Application reopened";
}

async function findExistingPublicPartner(db: any, application: Record<string, any>) {
  const queryCandidates: Array<{ field: string; value: string }> = [];

  if (application.email) {
    queryCandidates.push({ field: "email", value: application.email });
  }

  if (application.whatsapp) {
    queryCandidates.push({ field: "whatsapp", value: application.whatsapp });
  }

  for (const candidate of queryCandidates) {
    const { data } = await db.from("partners").select("id").eq(candidate.field, candidate.value).maybeSingle();
    if (data?.id) {
      return data.id as string;
    }
  }

  return null as string | null;
}

async function createOrReusePublicPartner(db: any, application: Record<string, any>, reviewer: string) {
  if (!application) {
    return { partnerId: null as string | null, created: false };
  }

  if (application.partner_id) {
    const { data: linkedPartner } = await db.from("partners").select("id").eq("id", application.partner_id).maybeSingle();
    if (linkedPartner?.id) {
      return { partnerId: linkedPartner.id as string, created: false };
    }
  }

  const existingPartnerId = await findExistingPublicPartner(db, application);
  if (existingPartnerId) {
    return { partnerId: existingPartnerId, created: false };
  }

  const baseSlug = createPropertySlug(application.business_name, "partner");
  const { data: existingSlugRows } = await db.from("partners").select("slug").ilike("slug", `${baseSlug}%`);
  const existingSlugs = new Set((existingSlugRows ?? []).map((row: { slug: string }) => row.slug));

  let slug = baseSlug;
  let suffix = 2;
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const { data: membershipPlanRow } = application.membership_plan
    ? await db.from("membership_plans").select("id").ilike("name", `%${application.membership_plan}%`).maybeSingle()
    : { data: null };

  const { data: insertedPartner, error: insertError } = await db
    .from("partners")
    .insert({
      business_name: application.business_name,
      slug,
      owner_name: application.contact_person,
      category: application.business_type,
      status: "verified",
      verification_status: "verified",
      membership_plan_id: membershipPlanRow?.id ?? null,
      whatsapp: application.whatsapp,
      email: application.email,
      website: application.website,
      address: application.address,
      island: application.island,
      google_maps_link: application.google_maps_link,
      instagram: application.instagram,
      facebook: application.facebook,
      short_description: application.short_description,
      registration_number: application.registration_number,
      metadata: application.metadata ?? {},
      lead_source: `Application ${application.application_reference ?? application.id}`,
      priority: "high"
    })
    .select("id")
    .single();

  if (insertError || !insertedPartner?.id) {
    throw new Error(insertError?.message ?? "Could not create public partner record.");
  }

  return { partnerId: insertedPartner.id as string, created: true };
}

async function ensurePublicListing(db: any, application: Record<string, any>, partnerId: string) {
  const businessType = String(application.business_type ?? "").toLowerCase();
  const slug = createPropertySlug(application.business_name, businessType || "partner");

  if (businessType.includes("guest") || businessType.includes("stay") || businessType.includes("house")) {
    const { data: existingProperty } = await db.from("properties").select("id").eq("slug", slug).maybeSingle();
    const payload = {
      partner_id: partnerId,
      name: application.business_name,
      slug,
      island: application.island ?? "Thoddoo",
      address: application.address,
      whatsapp: application.whatsapp,
      email: application.email,
      website: application.website,
      google_maps_link: application.google_maps_link,
      short_description: application.short_description ?? application.business_name,
      full_description: application.short_description ?? application.business_name,
      hero_image_path: "/images/hero-thoddoo.jpg",
      membership_plan_id: null,
      verification_status: "verified",
      publication_status: "published",
      featured: true,
      seo_title: application.business_name,
      seo_description: application.short_description ?? application.business_name
    };

    if (existingProperty?.id) {
      await db.from("properties").update(payload).eq("id", existingProperty.id);
    } else {
      await db.from("properties").insert(payload);
    }
    return;
  }

  if (businessType.includes("restaurant") || businessType.includes("dining") || businessType.includes("food")) {
    const { data: existingRestaurant } = await db.from("restaurants").select("id").eq("slug", slug).maybeSingle();
    const payload = {
      slug,
      name: application.business_name,
      description: application.short_description ?? application.business_name,
      cuisine: [application.business_type],
      location: application.address,
      image_path: "/images/hero-thoddoo.jpg",
      publication_status: "published",
      featured: true
    };

    if (existingRestaurant?.id) {
      await db.from("restaurants").update(payload).eq("id", existingRestaurant.id);
    } else {
      await db.from("restaurants").insert(payload);
    }
    return;
  }

  if (businessType.includes("water") || businessType.includes("excurs") || businessType.includes("experience") || businessType.includes("sport")) {
    const { data: existingExperience } = await db.from("experiences").select("id").eq("slug", slug).maybeSingle();
    const payload = {
      slug,
      title: application.business_name,
      description: application.short_description ?? application.business_name,
      category: businessType.includes("water") ? "water-sports" : "experience",
      duration: "Half day",
      price: null,
      image_path: "/images/hero-thoddoo.jpg",
      highlights: [application.business_type],
      publication_status: "published",
      featured: true
    };

    if (existingExperience?.id) {
      await db.from("experiences").update(payload).eq("id", existingExperience.id);
    } else {
      await db.from("experiences").insert(payload);
    }
    return;
  }

  if (businessType.includes("transfer") || businessType.includes("boat") || businessType.includes("speed")) {
    const { data: existingTransfer } = await db.from("transfers").select("id").eq("slug", slug).maybeSingle();
    const payload = {
      slug,
      title: application.business_name,
      transfer_type: application.business_type,
      description: application.short_description ?? application.business_name,
      duration: "Flexible",
      price: null,
      departure_point: application.address,
      arrival_point: application.address,
      image_path: "/images/hero-thoddoo.jpg",
      highlights: [application.business_type],
      publication_status: "published",
      featured: true
    };

    if (existingTransfer?.id) {
      await db.from("transfers").update(payload).eq("id", existingTransfer.id);
    } else {
      await db.from("transfers").insert(payload);
    }
  }
}

async function ensurePartnerInvitationPreview(db: any, applicationId: string, partnerId: string, reviewer: string, email: string) {
  const { data: existingInvitation } = await db
    .from("partner_account_invitations")
    .select("id")
    .eq("application_id", applicationId)
    .maybeSingle();

  if (existingInvitation?.id) {
    return;
  }

  const invitationUrl = `/partner/forgot-password?email=${encodeURIComponent(email)}`;
  await db.from("partner_account_invitations").insert({
    partner_id: partnerId,
    application_id: applicationId,
    email,
    status: "preview",
    invitation_url: invitationUrl,
    notes: "Manual preview only. Send a Supabase Auth invitation or password reset after creating/linking the auth user.",
    created_by: reviewer
  });

  await logPartnerAuditEvent("invitation_preview_created", { applicationId, email }, partnerId);
}

export async function updateSupabasePartnerApplicationDecision(
  input: AdminApplicationDecisionInput
): Promise<AdminApplicationDecisionResult> {
  const hasSession = await hasAdminDemoSession();
  if (!hasSession) {
    return { ok: false, message: "Admin session is required." };
  }

  if (getDataMode() !== "supabase") {
    return { ok: false, message: "Mock mode is active." };
  }

  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return { ok: false, message: "Supabase service role is not configured." };
  }

  const status = getDecisionStatus(input.action);
  const reviewer = sanitizeText(input.reviewer || "Admin", 120);
  const note = sanitizeText(input.note, 1200);
  const decisionMessage = getDecisionMessage(input.action);
  const reviewNote = [decisionMessage, reviewer ? `Reviewer: ${reviewer}` : "", note].filter(Boolean).join(" | ");

  const { data: existing, error: readError } = await (supabase as any)
    .from("partner_applications")
    .select(
      "id, application_reference, business_name, business_type, contact_person, whatsapp, email, island, address, google_maps_link, website, instagram, facebook, short_description, registration_number, membership_plan, metadata, status, partner_id, review_notes, missing_information"
    )
    .eq("id", input.applicationId)
    .maybeSingle();

  if (readError) {
    return { ok: false, message: readError.message };
  }

  if (!existing) {
    return { ok: false, message: "Application not found." };
  }

  const reviewNotes = Array.isArray(existing?.review_notes) ? existing.review_notes : [];
  const requestedChanges = input.action === "request_changes" ? input.requestedChanges.map((change) => sanitizeText(change, 160)) : [];

  let linkedPartnerId = existing.partner_id as string | null;

  if (input.action === "approve_publish") {
    const alreadyApprovedAndLinked = existing.status === "approved" && existing.partner_id;
    if (!alreadyApprovedAndLinked) {
      try {
        const partnerResult = await createOrReusePublicPartner(supabase as any, existing, reviewer);
        linkedPartnerId = partnerResult.partnerId;
        if (!linkedPartnerId) {
          return { ok: false, message: "Could not create or link a public partner record." };
        }
      } catch (partnerError) {
        return {
          ok: false,
          message: partnerError instanceof Error ? partnerError.message : "Could not create or link a public partner record."
        };
      }
    }
  }

  const { error: updateError } = await (supabase as any)
    .from("partner_applications")
    .update({
      status,
      partner_id: linkedPartnerId ?? null,
      missing_information: requestedChanges,
      review_notes: [reviewNote, ...reviewNotes].filter(Boolean),
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewer,
      updated_at: new Date().toISOString()
    })
    .eq("id", input.applicationId);

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  if (input.action === "approve_publish" && linkedPartnerId) {
    await ensurePartnerInvitationPreview(supabase as any, input.applicationId, linkedPartnerId, reviewer, existing.email);
    await ensurePublicListing(supabase as any, existing, linkedPartnerId);
    await (supabase as any)
      .from("partner_application_verification_documents")
      .update({ status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: reviewer })
      .eq("application_id", input.applicationId)
      .neq("status", "missing");
  }

  if (input.action === "reject") {
    await (supabase as any)
      .from("partner_application_verification_documents")
      .update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: reviewer, admin_note: note || null })
      .eq("application_id", input.applicationId);
  }

  if (input.action === "request_changes") {
    await (supabase as any)
      .from("partner_application_verification_documents")
      .update({ status: "more_required", reviewed_at: new Date().toISOString(), reviewed_by: reviewer, admin_note: note || null })
      .eq("application_id", input.applicationId)
      .eq("status", "missing");
  }

  await (supabase as any).from("crm_notes").insert({
    author: "Admin",
    body: `${decisionMessage} for application ${input.applicationId}.${note ? ` ${note}` : ""}`
  });

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${input.applicationId}`);

  return {
    ok: true,
    message: decisionMessage,
    status,
    requestedChanges,
    linkedPartnerId: linkedPartnerId ?? undefined
  };
}
