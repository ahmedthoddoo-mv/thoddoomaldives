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
  if (action === "start_review") return "review_started";
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

  function applySupabaseResult(action: AdminApplicationDecisionAction, status: PartnerApplicationStatus, responseMessage: string) {
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
    if (action === "request_changes" && !note.trim()) {
      setMessage("Add a note before requesting changes.");
      return;
    }

    if (dataSource !== "supabase") {
      if (action === "start_review") applyResult(PartnerApplicationRepository.startReview(application.id, reviewer || "Admin"));
      if (action === "approve_draft") applyResult(PartnerApplicationRepository.approve(application.id, false));
      if (action === "approve_publish") applyResult(PartnerApplicationRepository.approve(application.id, true));
      if (action === "request_changes") applyResult(PartnerApplicationRepository.requestChanges(application.id, selectedChanges, note));
      if (action === "reject") applyResult(PartnerApplicationRepository.reject(application.id, note));
      if (action === "reopen") applyResult(PartnerApplicationRepository.reopen(application.id));
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

      applySupabaseResult(action, result.status, result.message);
    });
  }

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
        <button
          type="button"
          disabled={isPending}
          onClick={() => decide("start_review")}
        >
          Start review
        </button>
        <button type="button" disabled={isPending} onClick={() => decide("approve_draft")}>
          Approve and draft listing
        </button>
        <button type="button" disabled={isPending} onClick={() => decide("approve_publish")}>
          Approve and publish listing
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
        <textarea
          value={note}
          rows={4}
          onChange={(event) => setNote(event.target.value)}
          aria-required="true"
        />
      </label>

      <div className="applicationDecisionActions">
        <button
          type="button"
          disabled={isPending}
          onClick={() => decide("request_changes")}
        >
          Request changes
        </button>
        <button type="button" disabled={isPending} onClick={() => decide("reject")}>
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
