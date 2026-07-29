"use server";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { SupabaseDatabaseClient } from "@/lib/supabase/server";
import { requireAdminSession } from "@/lib/admin/adminAuth";
import { getDataMode } from "@/lib/supabase/status";
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

async function deliverPartnerInvitation(
  db: SupabaseDatabaseClient,
  applicationId: string,
  reviewer: string,
  partnerId: string
) {
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
  if (!application || !invitationRecord || invitationRecord.status === "sent" || invitationRecord.status === "accepted") return;
  if (
    invitationRecord.status === "sending"
    && invitationRecord.delivery_attempted_at
    && Date.now() - new Date(invitationRecord.delivery_attempted_at).getTime() < 10 * 60 * 1000
  ) {
    return;
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
    return;
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
  if (!claimed) return;

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
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

  await logPartnerAuditEvent(
    "invitation_preview_created",
    { applicationId, email: application.email, sent: !invitationError },
    partnerId,
    authUserId
  );
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
    .select("review_notes")
    .eq("id", input.applicationId)
    .maybeSingle();

  if (readError) {
    return { ok: false, message: readError.message };
  }

  const reviewNotes = Array.isArray(existing?.review_notes) ? existing.review_notes : [];
  const requestedChanges = input.action === "request_changes" ? input.requestedChanges.map((change) => sanitizeText(change, 160)) : [];

  if (input.action === "approve_draft" || input.action === "approve_publish") {
    const { data, error: approvalError } = await supabase.rpc("approve_partner_application", {
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
      ? data as { partnerId?: string }
      : {};
    if (!approval.partnerId) {
      return { ok: false, message: "Approval transaction did not return a partner link." };
    }
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

  if (input.action === "request_changes") {
    await supabase
      .from("partner_application_verification_documents")
      .update({ status: "more_required", reviewed_at: new Date().toISOString(), reviewed_by: reviewer, admin_note: note || null })
      .eq("application_id", input.applicationId)
      .eq("status", "missing");
  }

  await supabase.from("crm_notes").insert({
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
