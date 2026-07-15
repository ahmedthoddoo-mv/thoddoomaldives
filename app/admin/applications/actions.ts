"use server";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getDataMode } from "@/lib/supabase/status";
import { createPropertySlug } from "@/lib/properties/propertySlug";
import { logPartnerAuditEvent } from "@/lib/partner-portal/partnerAuth";
import type { PartnerApplicationStatus } from "@/types/partner-application";

export type AdminApplicationDecisionAction =
  | "start_review"
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
};

function sanitizeText(value: string, maxLength = 1200) {
  return value.replace(/[<>]/g, "").trim().slice(0, maxLength);
}

function getDecisionStatus(action: AdminApplicationDecisionAction): PartnerApplicationStatus {
  if (action === "start_review" || action === "reopen") return "under_review";
  if (action === "approve_draft" || action === "approve_publish") return "approved";
  if (action === "request_changes") return "changes_requested";
  if (action === "reject") return "rejected";
  return "submitted";
}

function getDecisionMessage(action: AdminApplicationDecisionAction) {
  if (action === "start_review") return "Review started";
  if (action === "approve_draft") return "Application approved. Listing remains draft.";
  if (action === "approve_publish") return "Application approved for publishing.";
  if (action === "request_changes") return "Changes requested";
  if (action === "reject") return "Application rejected";
  return "Application reopened";
}

async function ensurePartnerAndInvitationPreview(db: any, applicationId: string, reviewer: string) {
  const { data: application, error } = await db
    .from("partner_applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle();

  if (error || !application) {
    return;
  }

  const baseSlug = createPropertySlug(application.business_name, "partner");
  const { data: existingByEmail } = await db
    .from("partners")
    .select("id, slug")
    .eq("email", application.email)
    .maybeSingle();

  let partner = existingByEmail;
  if (!partner) {
    const { data: existingSlugRows } = await db
      .from("partners")
      .select("slug")
      .ilike("slug", `${baseSlug}%`);
    const existingSlugs = new Set((existingSlugRows ?? []).map((row: { slug: string }) => row.slug));
    let slug = baseSlug;
    let suffix = 2;
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const { data: insertedPartner } = await db
      .from("partners")
      .insert({
        business_name: application.business_name,
        slug,
        owner_name: application.contact_person,
        category: application.business_type,
        status: "pending",
        verification_status: "pending",
        whatsapp: application.whatsapp,
        email: application.email,
        website: application.website,
        address: application.address,
        lead_source: `Application ${application.application_reference ?? application.id}`,
        priority: "high"
      })
      .select("id, slug")
      .single();
    partner = insertedPartner;
  }

  if (!partner?.id) {
    return;
  }

  await db.from("partner_applications").update({ partner_id: partner.id }).eq("id", applicationId);

  const invitationUrl = `/partner/forgot-password?email=${encodeURIComponent(application.email)}`;
  await db.from("partner_account_invitations").insert({
    partner_id: partner.id,
    application_id: applicationId,
    email: application.email,
    status: "preview",
    invitation_url: invitationUrl,
    notes: "Manual preview only. Send a Supabase Auth invitation or password reset after creating/linking the auth user.",
    created_by: reviewer
  });

  await logPartnerAuditEvent("invitation_preview_created", { applicationId, email: application.email }, partner.id);
}

export async function updateSupabasePartnerApplicationDecision(
  input: AdminApplicationDecisionInput
): Promise<AdminApplicationDecisionResult> {
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
    .select("review_notes")
    .eq("id", input.applicationId)
    .maybeSingle();

  if (readError) {
    return { ok: false, message: readError.message };
  }

  const reviewNotes = Array.isArray(existing?.review_notes) ? existing.review_notes : [];
  const requestedChanges = input.action === "request_changes" ? input.requestedChanges.map((change) => sanitizeText(change, 160)) : [];

  const { error: updateError } = await (supabase as any)
    .from("partner_applications")
    .update({
      status,
      missing_information: requestedChanges,
      review_notes: [reviewNote, ...reviewNotes].filter(Boolean),
      updated_at: new Date().toISOString()
    })
    .eq("id", input.applicationId);

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  if (input.action === "approve_draft" || input.action === "approve_publish") {
    await (supabase as any)
      .from("partner_application_verification_documents")
      .update({ status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: reviewer })
      .eq("application_id", input.applicationId)
      .neq("status", "missing");

    await ensurePartnerAndInvitationPreview(supabase as any, input.applicationId, reviewer);
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

  return {
    ok: true,
    message: decisionMessage,
    status,
    requestedChanges
  };
}
