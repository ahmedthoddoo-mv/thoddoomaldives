"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { platformConfig } from "@/lib/config/platform";
import { sendEmail } from "@/lib/email/client";
import { buildPartnerApprovedEmail } from "@/lib/email/templates/partner-approved";
import { buildPartnerPendingEmail } from "@/lib/email/templates/partner-pending";
import { buildPartnerRejectedEmail } from "@/lib/email/templates/partner-rejected";
import type { SupabaseDatabaseClient } from "@/lib/supabase/server";
import { requireAdminSession } from "@/lib/admin/adminAuth";
import { getDataMode } from "@/lib/supabase/status";
import { logPartnerAuditEvent } from "@/lib/partner-portal/partnerAuth";
import type { PartnerApplicationStatus } from "@/types/partner-application";
import type { Json } from "@/lib/supabase/types";
import { revalidatePublicListingPaths } from "@/lib/cache/publicRoutes";
import { normalizePartnerApplicationPricingUnit } from "@/lib/applications/pricingUnits";

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
  partnerId?: string;
  listingId?: string;
  listingWorkflow?: string;
};

export type AdminApplicationReviewInput = {
  applicationId: string;
  reviewer: string;
  common: Record<string, string>;
  category: Record<string, string>;
  prices: Array<{ name: string; price: string; currency: string; unit: string }>;
  verificationNotes: string;
  publicMediaIds: string[];
  mediaRightsConfirmed: boolean;
};

export async function saveAdminApplicationReview(input: AdminApplicationReviewInput) {
  const admin = await requireAdminSession();
  if (getDataMode() !== "supabase") return { ok: false, message: "Application reviews require Supabase mode." };
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) return { ok: false, message: "Supabase service role is not configured." };

  const reviewer = sanitizeText(input.reviewer || "Admin", 120);
  const cleanRecord = (record: Record<string, string>) => Object.fromEntries(
    Object.entries(record).map(([key, value]) => [sanitizeText(key, 80), sanitizeText(value, 5000)])
  );
  const prices = input.prices.map((price) => ({
    name: sanitizeText(price.name, 180),
    price: price.price.trim() === "" ? null : Number(price.price),
    currency: price.currency === "MVR" ? "MVR" : "USD",
    unit: normalizePartnerApplicationPricingUnit(price.unit)
  }));
  if (prices.some((price) => !price.unit)) {
    return { ok: false, message: "Choose a valid price unit before saving." };
  }
  if (prices.some((price) => price.price !== null && (!Number.isFinite(price.price) || price.price <= 0))) {
    return { ok: false, message: "Prices must be positive or blank for Price on request." };
  }

  const { data, error } = await supabase.rpc("admin_save_application_review", {
    application_uuid: input.applicationId,
    reviewer_user_id: admin.userId,
    reviewer_name: reviewer,
    review_payload: {
      common: cleanRecord(input.common),
      category: cleanRecord(input.category),
      verificationNotes: sanitizeText(input.verificationNotes, 5000),
      publicMediaIds: input.publicMediaIds,
      mediaRightsConfirmed: input.mediaRightsConfirmed
    } as Json,
    price_payload: prices as Json
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Reviewed values saved and added to the application timeline.", data };
}

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

async function findAuthUserByEmail(db: SupabaseDatabaseClient, email: string) {
  const normalizedEmail = email.toLowerCase();
  for (let page = 1; page <= 100; page += 1) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`Auth user lookup failed: ${error.message}`);
    const match = data.users.find((user) => user.email?.toLowerCase() === normalizedEmail);
    if (match) return match;
    if (data.users.length < 1000) return null;
  }
  throw new Error("Auth user lookup exceeded the supported pagination limit.");
}

async function upsertPartnerInvitationPreview(
  db: SupabaseDatabaseClient,
  applicationId: string,
  partnerId: string,
  reviewer: string
) {
  const { data: application, error: applicationError } = await db
    .from("partner_applications")
    .select("business_name, email")
    .eq("id", applicationId)
    .maybeSingle();

  if (applicationError) throw new Error(`Application lookup failed: ${applicationError.message}`);
  if (!application?.email) {
    throw new Error("An owner email is required before sending an invitation.");
  }

  const { data: existingPreview, error: previewReadError } = await db
    .from("partner_account_invitations")
    .select("id")
    .eq("application_id", applicationId)
    .eq("partner_id", partnerId)
    .neq("status", "cancelled")
    .maybeSingle();

  if (previewReadError) throw new Error(`Invitation lookup failed: ${previewReadError.message}`);
  if (existingPreview?.id) return existingPreview.id;

  const { data: createdPreview, error: previewInsertError } = await db
    .from("partner_account_invitations")
    .insert({
      application_id: applicationId,
      partner_id: partnerId,
      auth_user_id: null,
      email: application.email.toLowerCase(),
      invitation_url: `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")}/partner/login`,
      status: "preview",
      created_by: reviewer,
      notes: "Owner invitation prepared from the admin applications workflow."
    })
    .select("id")
    .single();

  if (previewInsertError || !createdPreview) {
    throw new Error(previewInsertError?.message ?? "Invitation preview could not be created.");
  }

  return createdPreview.id;
}

async function deliverPartnerInvitation(
  db: SupabaseDatabaseClient,
  applicationId: string,
  reviewer: string,
  partnerId: string
) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const { data: application } = await db
    .from("partner_applications")
    .select("business_name, email")
    .eq("id", applicationId)
    .maybeSingle();
  const { data: invitationRecord } = await db
    .from("partner_account_invitations")
    .select("id, status, auth_user_id, idempotency_key, delivery_attempted_at")
    .eq("application_id", applicationId)
    .neq("status", "cancelled")
    .maybeSingle();
  if (!application || !invitationRecord || invitationRecord.status === "sent" || invitationRecord.status === "accepted") return false;
  if (
    invitationRecord.status === "sending"
    && invitationRecord.delivery_attempted_at
    && Date.now() - new Date(invitationRecord.delivery_attempted_at).getTime() < 10 * 60 * 1000
  ) {
    return false;
  }

  const existingUser = await findAuthUserByEmail(db, application.email);
  if (existingUser) {
    const { error: partnerLinkError } = await db.from("partners").update({ auth_user_id: existingUser.id }).eq("id", partnerId);
    if (partnerLinkError) throw new Error(`Partner Auth link failed: ${partnerLinkError.message}`);
    const { error: reconcileError } = await db.from("partner_account_invitations").update({
      auth_user_id: existingUser.id,
      status: "sent",
      invitation_url: `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")}/partner/login`,
      notes: "Existing Supabase Auth account linked without sending a duplicate invitation.",
      delivery_error: null,
      sent_at: invitationRecord.status === "sending" ? new Date().toISOString() : undefined
    }).eq("id", invitationRecord.id).in("status", ["preview", "sending"]);
    if (reconcileError) throw new Error(`Invitation reconciliation failed: ${reconcileError.message}`);
    return true;
  }

  if (invitationRecord.status === "sending") {
    const { error: releaseError } = await db.from("partner_account_invitations").update({
      status: "preview",
      delivery_error: "Previous delivery did not produce a recoverable Auth user."
    }).eq("id", invitationRecord.id).eq("status", "sending");
    if (releaseError) throw new Error(`Invitation retry release failed: ${releaseError.message}`);
  }

  const { data: claimed, error: claimError } = await db
    .from("partner_account_invitations")
    .update({
      status: "sending",
      delivery_attempted_at: new Date().toISOString(),
      delivery_error: null
    })
    .eq("id", invitationRecord.id)
    .eq("status", "preview")
    .select("id, idempotency_key")
    .maybeSingle();
  if (claimError) throw new Error(`Invitation claim failed: ${claimError.message}`);
  if (!claimed) return false;

  const { data: invitation, error: invitationError } = await db.auth.admin.inviteUserByEmail(
    application.email,
    {
      redirectTo: `${siteUrl}/partner/reset-password`,
      data: {
        partner_id: partnerId,
        application_id: applicationId,
        business_name: application.business_name,
        invitation_idempotency_key: claimed.idempotency_key
      }
    }
  );

  const authUserId = invitation?.user?.id ?? null;
  if (authUserId) {
    const { error: partnerLinkError } = await db.from("partners").update({ auth_user_id: authUserId }).eq("id", partnerId);
    if (partnerLinkError) throw new Error(`Partner Auth link failed: ${partnerLinkError.message}`);
  }

  const { error: finalizeError } = await db.from("partner_account_invitations").update({
    auth_user_id: authUserId,
    status: invitationError ? "preview" : "sent",
    invitation_url: `${siteUrl}/partner/login`,
    notes: invitationError
      ? `Invitation requires admin follow-up: ${invitationError.message}`
      : "Secure Supabase partner invitation sent.",
    created_by: reviewer,
    delivery_error: invitationError?.message ?? null,
    sent_at: invitationError ? null : new Date().toISOString()
  }).eq("id", invitationRecord.id).eq("status", "sending");
  if (finalizeError) {
    throw new Error(`Invitation delivery state could not be finalized: ${finalizeError.message}`);
  }

  if (!invitationError) {
    const approvalEmail = buildPartnerApprovedEmail({
      businessName: application.business_name,
      dashboardUrl: `${siteUrl}/partner/dashboard`,
      setupUrl: `${siteUrl}/partner/business`,
      supportEmail: platformConfig.companyContact.email,
      siteUrl
    });
    const approvalEmailResult = await sendEmail({
      to: { address: application.email, name: application.business_name },
      ...approvalEmail
    });
    if (!approvalEmailResult.ok || approvalEmailResult.skipped) {
      const emailNote = approvalEmailResult.ok
        ? ("reason" in approvalEmailResult ? approvalEmailResult.reason : "Email delivery was skipped.")
        : approvalEmailResult.error;
      console.warn("[partner-approval-email]", {
        applicationId,
        skipped: approvalEmailResult.skipped,
        reason: emailNote
      });
    }
  }

  await logPartnerAuditEvent(
    "invitation_preview_created",
    { applicationId, email: application.email, sent: !invitationError },
    partnerId,
    authUserId
  );

  return true;
}

export async function updateSupabasePartnerApplicationDecision(
  input: AdminApplicationDecisionInput
): Promise<AdminApplicationDecisionResult> {
  const admin = await requireAdminSession();

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
  if (input.action === "request_changes" && !note) {
    return { ok: false, message: "A note is required when requesting changes." };
  }
  const decisionMessage = getDecisionMessage(input.action);
  const reviewNote = [decisionMessage, reviewer ? `Reviewer: ${reviewer}` : "", note].filter(Boolean).join(" | ");

  const { data: existing, error: readError } = await supabase
    .from("partner_applications")
    .select("review_notes, status, business_name, email")
    .eq("id", input.applicationId)
    .maybeSingle();

  if (readError) {
    return { ok: false, message: readError.message };
  }

  const reviewNotes = Array.isArray(existing?.review_notes) ? existing.review_notes : [];
  const requestedChanges = input.action === "request_changes" ? input.requestedChanges.map((change) => sanitizeText(change, 160)) : [];

  if (input.action === "approve_draft" || input.action === "approve_publish") {
    const { data, error: approvalError } = await supabase.rpc("approve_partner_application_all_types", {
      application_uuid: input.applicationId,
      reviewer_user_id: admin.userId,
      reviewer_name: reviewer,
      publish_listing: input.action === "approve_publish",
      review_note: reviewNote
    });
    if (approvalError) {
      console.error("[partner-application-approval]", {
        applicationId: input.applicationId,
        code: approvalError.code,
        message: approvalError.message
      });
      return { ok: false, message: `Approval failed before completion: ${approvalError.message}` };
    }
    const approval = data && typeof data === "object" && !Array.isArray(data)
      ? data as { partnerId?: string; listingId?: string; listingWorkflow?: string }
      : {};
    if (!approval.partnerId) {
      return { ok: false, message: "Approval transaction did not return a partner link." };
    }
    if (input.action === "approve_publish") revalidatePublicListingPaths();
    try {
      await deliverPartnerInvitation(supabase, input.applicationId, reviewer, approval.partnerId);
    } catch (error) {
      console.error("[partner-invitation-delivery]", {
        applicationId: input.applicationId,
        message: error instanceof Error ? error.message : "Unknown invitation delivery failure"
      });
      return {
        ok: false,
        message: "Application approval completed, but account invitation delivery needs an administrator retry."
      };
    }
    revalidatePath("/admin/applications");
    revalidatePath(`/admin/applications/${input.applicationId}`);
    return {
      ok: true,
      message: decisionMessage,
      status,
      partnerId: approval.partnerId,
      listingId: typeof approval.listingId === "string" ? approval.listingId : undefined,
      listingWorkflow: typeof approval.listingWorkflow === "string" ? approval.listingWorkflow : undefined
    };
  } else {
    const { error: updateError } = await supabase
      .from("partner_applications")
      .update({
        status,
        missing_information: requestedChanges,
        review_notes: [reviewNote, ...reviewNotes].filter(Boolean),
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewer,
        updated_at: new Date().toISOString()
      })
      .eq("id", input.applicationId);
    if (updateError) return { ok: false, message: updateError.message };
  }

  if (input.action === "reject") {
    await supabase
      .from("partner_application_verification_documents")
      .update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: reviewer, admin_note: note || null })
      .eq("application_id", input.applicationId);
  }

  if (input.action === "start_review" && existing?.business_name && existing?.email && existing.status !== "under_review") {
    const pendingEmail = buildPartnerPendingEmail({
      businessName: existing.business_name,
      supportEmail: platformConfig.companyContact.email,
      siteUrl: platformConfig.companyContact.website.replace(/\/$/, "")
    });
    const emailResult = await sendEmail({
      to: { address: existing.email, name: existing.business_name },
      ...pendingEmail
    });
    if (!emailResult.ok || emailResult.skipped) {
      const emailNote = emailResult.ok
        ? ("reason" in emailResult ? emailResult.reason : "Email delivery was skipped.")
        : emailResult.error;
      console.warn("[partner-pending-email]", {
        applicationId: input.applicationId,
        skipped: emailResult.skipped,
        reason: emailNote
      });
    }
  }

  if (input.action === "reject" && existing?.business_name && existing?.email && existing.status !== "rejected") {
    const rejectedEmail = buildPartnerRejectedEmail({
      businessName: existing.business_name,
      supportEmail: platformConfig.companyContact.email,
      siteUrl: platformConfig.companyContact.website.replace(/\/$/, ""),
      reason: note || undefined
    });
    const emailResult = await sendEmail({
      to: { address: existing.email, name: existing.business_name },
      ...rejectedEmail
    });
    if (!emailResult.ok || emailResult.skipped) {
      const emailNote = emailResult.ok
        ? ("reason" in emailResult ? emailResult.reason : "Email delivery was skipped.")
        : emailResult.error;
      console.warn("[partner-rejected-email]", {
        applicationId: input.applicationId,
        skipped: emailResult.skipped,
        reason: emailNote
      });
    }
  }

  if (input.action === "request_changes") {
    await supabase
      .from("partner_application_verification_documents")
      .update({ status: "more_required", reviewed_at: new Date().toISOString(), reviewed_by: reviewer, admin_note: note || null })
      .eq("application_id", input.applicationId)
      .eq("status", "missing");
  }

  const { data: linkedApplication } = await supabase.from("partner_applications").select("partner_id").eq("id", input.applicationId).maybeSingle();
  await supabase.from("crm_notes").insert({
    partner_id: linkedApplication?.partner_id ?? null,
    author: "Admin",
    body: `${decisionMessage} for application ${input.applicationId}.${note ? ` ${note}` : ""}`
  });

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${input.applicationId}`);

  return {
    ok: true,
    message: decisionMessage,
    status,
    requestedChanges
  };
}

export async function assignExistingPartnerToApplication(input: {
  applicationId: string;
  partnerId: string;
  reviewer: string;
}) {
  const admin = await requireAdminSession();
  if (getDataMode() !== "supabase") {
    return { ok: false, message: "Mock mode is active." };
  }

  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return { ok: false, message: "Supabase service role is not configured." };
  }

  const reviewer = sanitizeText(input.reviewer || "Admin", 120);
  const { data, error } = await supabase.rpc("admin_assign_application_partner", {
    admin_user_id: admin.userId,
    application_uuid: input.applicationId,
    reviewer_name: reviewer,
    partner_uuid: input.partnerId
  });

  if (error || !data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, message: error?.message ?? "Partner assignment failed." };
  }

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${input.applicationId}`);
  return {
    ok: true,
    message: "Existing partner linked to the application and business.",
    data
  };
}

export async function inviteApplicationOwner(input: {
  applicationId: string;
  reviewer: string;
  ownerName: string;
  ownerEmail: string;
}) {
  const admin = await requireAdminSession();
  if (getDataMode() !== "supabase") {
    return { ok: false, message: "Mock mode is active." };
  }

  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return { ok: false, message: "Supabase service role is not configured." };
  }

  const reviewer = sanitizeText(input.reviewer || "Admin", 120);
  const ownerName = sanitizeText(input.ownerName, 120);
  const ownerEmail = sanitizeText(input.ownerEmail, 320).toLowerCase();
  if (!ownerEmail) {
    return { ok: false, message: "Owner email is required." };
  }

  const { error: applicationUpdateError } = await supabase
    .from("partner_applications")
    .update({
      contact_person: ownerName,
      email: ownerEmail,
      updated_at: new Date().toISOString()
    })
    .eq("id", input.applicationId);
  if (applicationUpdateError) {
    return { ok: false, message: applicationUpdateError.message };
  }

  const { data, error } = await supabase.rpc("admin_assign_application_partner", {
    admin_user_id: admin.userId,
    application_uuid: input.applicationId,
    reviewer_name: reviewer,
    partner_uuid: undefined
  });
  if (error || !data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, message: error?.message ?? "Owner invitation setup failed." };
  }

  const assignment = data as { partnerId?: string };
  if (!assignment.partnerId) {
    return { ok: false, message: "Owner invitation setup did not return a partner link." };
  }

  try {
    await upsertPartnerInvitationPreview(supabase, input.applicationId, assignment.partnerId, reviewer);
    await deliverPartnerInvitation(supabase, input.applicationId, reviewer, assignment.partnerId);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Owner invitation delivery failed."
    };
  }

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${input.applicationId}`);
  return {
    ok: true,
    message: "Owner invitation sent and linked to the application.",
    data
  };
}

export async function linkExistingBusinessToApplication(input: {
  applicationId: string;
  listingId: string;
}) {
  const admin = await requireAdminSession();
  if (getDataMode() !== "supabase") {
    return { ok: false, message: "Mock mode is active." };
  }

  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return { ok: false, message: "Supabase service role is not configured." };
  }

  const { data, error } = await supabase.rpc("admin_link_application_listing", {
    admin_user_id: admin.userId,
    application_uuid: input.applicationId,
    listing_uuid: input.listingId
  });

  if (error || !data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, message: error?.message ?? "Existing business could not be linked." };
  }

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${input.applicationId}`);
  return {
    ok: true,
    message: "Existing business linked to the application.",
    data
  };
}
