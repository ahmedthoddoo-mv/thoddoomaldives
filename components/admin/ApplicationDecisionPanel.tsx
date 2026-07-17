"use client";

import { useState, useTransition } from "react";
import {
  updateSupabasePartnerApplicationDecision,
  type AdminApplicationDecisionAction
} from "@/app/admin/applications/actions";
import { requestedChangeOptions } from "@/data/partnerApplications";
import { PartnerApplicationRepository } from "@/lib/applications/partnerApplicationRepository";
import type {
  PartnerApplicationRecord,
  PartnerApplicationStatus,
  PartnerApplicationTimelineType
} from "@/types/partner-application";

type ApplicationDecisionPanelProps = {
  application: PartnerApplicationRecord;
  onChange: (application: PartnerApplicationRecord) => void;
  dataSource?: "mock" | "supabase" | "supabase_error";
};

function getTimelineType(action: AdminApplicationDecisionAction): PartnerApplicationTimelineType {
  if (action === "mark_under_review") return "review_started";
  if (action === "request_changes") return "changes_requested";
  if (action === "reject") return "rejected";
  if (action === "reopen") return "reopened";
  return "approved";
}

export function ApplicationDecisionPanel({ application, onChange, dataSource }: ApplicationDecisionPanelProps) {
  const [reviewer, setReviewer] = useState(application.assignedReviewer || "Ahmed");
  const [note, setNote] = useState("");
  const [selectedChanges, setSelectedChanges] = useState<string[]>(application.requestedChanges);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function applyResult(result: ReturnType<typeof PartnerApplicationRepository.approve>) {
    if (!result) {
      setMessage("Application could not be updated.");
      return;
    }

    onChange(result.application);
    setMessage(result.message);
  }

  function toggleChange(change: string) {
    setSelectedChanges((current) =>
      current.includes(change) ? current.filter((item) => item !== change) : [...current, change]
    );
  }

  function applySupabaseResult(action: AdminApplicationDecisionAction, status: PartnerApplicationStatus, responseMessage: string, linkedPartnerId?: string) {
    const verificationDocuments = application.verificationDocuments?.map((document) => {
      if (action === "approve_draft" || action === "approve_publish") {
        return document.status === "missing" ? document : { ...document, status: "approved" as const };
      }
      if (action === "reject") {
        return { ...document, status: "rejected" as const };
      }
      if (action === "request_changes" && document.status === "missing") {
        return { ...document, status: "more_required" as const };
      }
      return document;
    });

    onChange({
      ...application,
      status,
      assignedReviewer: reviewer || "Admin",
      requestedChanges: action === "request_changes" ? selectedChanges : [],
      adminNotes: note ? [note, ...application.adminNotes] : application.adminNotes,
      linkedPartnerId: linkedPartnerId ?? application.linkedPartnerId,
      listingPublicationStatus:
        action === "approve_publish"
          ? "published"
          : action === "approve_draft"
            ? "draft"
            : application.listingPublicationStatus,
      verificationStatus:
        action === "approve_draft" || action === "approve_publish"
          ? "verified"
          : action === "reject"
            ? "rejected"
            : application.verificationStatus,
      verificationDocuments,
      updatedDate: new Date().toISOString(),
      timeline: [
        {
          id: `${application.id}-${action}-${Date.now().toString(36)}`,
          type: getTimelineType(action),
          label: responseMessage,
          detail: note || responseMessage,
          date: new Date().toISOString(),
          actor: reviewer || "Admin"
        },
        ...application.timeline
      ]
    });
    setMessage(responseMessage);
  }

  function decide(action: AdminApplicationDecisionAction) {
    if (dataSource !== "supabase") {
      if (action === "mark_under_review") applyResult(PartnerApplicationRepository.startReview(application.id, reviewer || "Admin"));
      if (action === "approve_draft") applyResult(PartnerApplicationRepository.approve(application.id, false));
      if (action === "approve_publish") applyResult(PartnerApplicationRepository.approve(application.id, true));
      if (action === "request_changes") applyResult(PartnerApplicationRepository.requestChanges(application.id, selectedChanges, note));
      if (action === "reject") applyResult(PartnerApplicationRepository.reject(application.id, note));
      if (action === "reopen") applyResult(PartnerApplicationRepository.reopen(application.id));
      return;
    }

    if (action === "reject" && !window.confirm("Reject this application?")) {
      return;
    }

    if (action === "approve_publish" && !window.confirm("Approve and publish this application?")) {
      return;
    }

    startTransition(async () => {
      const result = await updateSupabasePartnerApplicationDecision({
        applicationId: application.id,
        action,
        reviewer,
        note,
        requestedChanges: selectedChanges
      });

      if (!result.ok || !result.status) {
        setMessage(result.message);
        return;
      }

      applySupabaseResult(action, result.status, result.message, result.linkedPartnerId);
    });
  }

  const actionMap = {
    mark_under_review: application.status !== "approved" && application.status !== "rejected" && application.status !== "withdrawn",
    approve_publish: application.status !== "approved" && application.status !== "rejected" && application.status !== "withdrawn",
    request_changes: application.status !== "approved" && application.status !== "rejected" && application.status !== "withdrawn",
    reject: application.status !== "approved" && application.status !== "rejected" && application.status !== "withdrawn"
  };

  return (
    <section className="adminPanel applicationDecisionPanel">
      <div className="adminSectionHeader">
        <p className="eyebrow">Admin decision</p>
        <h2>Review controls</h2>
      </div>

      <label>
        Assigned reviewer
        <input value={reviewer} onChange={(event) => setReviewer(event.target.value)} />
      </label>

      <div className="applicationDecisionActions">
        <button type="button" disabled={isPending || !actionMap.mark_under_review} onClick={() => decide("mark_under_review")}>
          Mark under review
        </button>
        <button type="button" disabled={isPending || !actionMap.approve_publish} onClick={() => decide("approve_publish")}>
          Approve & publish
        </button>
      </div>

      <div className="applicationChangeOptions" aria-label="Requested changes">
        {requestedChangeOptions.map((change) => (
          <label key={change}>
            <input
              type="checkbox"
              checked={selectedChanges.includes(change)}
              onChange={() => toggleChange(change)}
            />
            {change}
          </label>
        ))}
      </div>

      <label>
        Internal note or partner feedback
        <textarea value={note} rows={4} onChange={(event) => setNote(event.target.value)} />
      </label>

      <div className="applicationDecisionActions">
        <button type="button" disabled={isPending || !actionMap.request_changes} onClick={() => decide("request_changes")}>
          Request changes
        </button>
        <button type="button" disabled={isPending || !actionMap.reject} onClick={() => decide("reject")}>
          Reject
        </button>
        <button type="button" disabled={isPending} onClick={() => decide("reopen")}>
          Reopen
        </button>
      </div>

      {message ? <p className="propertySaveStatus propertySaveStatusSuccess">{message}</p> : null}
    </section>
  );
}
