"use client";

import { useState, useTransition } from "react";
import {
  assignExistingPartnerToApplication,
  inviteApplicationOwner,
  linkExistingBusinessToApplication,
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
  availableOwners: Array<{
    id: string;
    businessName: string;
    status: string;
    verificationStatus: string;
  }>;
  availableListings: Array<{
    id: string;
    name: string;
    slug: string;
    publicationStatus: string;
    verificationStatus: string;
    applicationId?: string;
  }>;
};

function getTimelineType(action: AdminApplicationDecisionAction): PartnerApplicationTimelineType {
  if (action === "start_review") return "review_started";
  if (action === "request_changes") return "changes_requested";
  if (action === "reject") return "rejected";
  if (action === "reopen") return "reopened";
  return "approved";
}

export function ApplicationDecisionPanel({
  application,
  onChange,
  dataSource,
  availableOwners,
  availableListings
}: ApplicationDecisionPanelProps) {
  const [reviewer, setReviewer] = useState(application.assignedReviewer || "Admin");
  const [note, setNote] = useState("");
  const [selectedChanges, setSelectedChanges] = useState<string[]>(application.requestedChanges);
  const [selectedPartnerId, setSelectedPartnerId] = useState(application.linkedPartnerId ?? "");
  const [ownerName, setOwnerName] = useState(application.contactPerson);
  const [ownerEmail, setOwnerEmail] = useState(application.email);
  const [selectedListingId, setSelectedListingId] = useState(application.linkedListingId ?? "");
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

  function applySupabaseResult(
    action: AdminApplicationDecisionAction,
    status: PartnerApplicationStatus,
    responseMessage: string,
    linkedPartnerId?: string,
    linkedListingId?: string
  ) {
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
      linkedPartnerId: linkedPartnerId ?? application.linkedPartnerId,
      linkedPartnerName: linkedPartnerId
        ? application.linkedPartnerName ?? availableOwners.find((owner) => owner.id === linkedPartnerId)?.businessName
        : application.linkedPartnerName,
      linkedListingId: linkedListingId ?? application.linkedListingId,
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

  function applyLinkedPartner(partnerId: string, partnerName?: string, responseMessage?: string) {
    onChange({
      ...application,
      linkedPartnerId: partnerId,
      linkedPartnerName: partnerName ?? availableOwners.find((owner) => owner.id === partnerId)?.businessName,
      status: application.status === "submitted" ? "under_review" : application.status,
      assignedReviewer: reviewer || "Admin",
      updatedDate: new Date().toISOString()
    });
    if (responseMessage) {
      setMessage(responseMessage);
    }
  }

  function applyLinkedListing(listingId: string, responseMessage?: string) {
    onChange({
      ...application,
      linkedListingId: listingId,
      updatedDate: new Date().toISOString()
    });
    if (responseMessage) {
      setMessage(responseMessage);
    }
  }

  function decide(action: AdminApplicationDecisionAction) {
    if (action === "request_changes" && !note.trim()) {
      setMessage("Add a note before requesting changes.");
      return;
    }

    if (dataSource === "mock") {
      if (action === "start_review") applyResult(PartnerApplicationRepository.startReview(application.id, reviewer || "Admin"));
      if (action === "approve_draft") applyResult(PartnerApplicationRepository.approve(application.id, false));
      if (action === "approve_publish") applyResult(PartnerApplicationRepository.approve(application.id, true));
      if (action === "request_changes") applyResult(PartnerApplicationRepository.requestChanges(application.id, selectedChanges, note));
      if (action === "reject") applyResult(PartnerApplicationRepository.reject(application.id, note));
      if (action === "reopen") applyResult(PartnerApplicationRepository.reopen(application.id));
      return;
    }
    if (dataSource !== "supabase") {
      setMessage("Application decisions are unavailable until the Supabase read succeeds.");
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

      if (result.partnerId) {
        setSelectedPartnerId(result.partnerId);
      }
      if (result.listingId) {
        setSelectedListingId(result.listingId);
      }

      applySupabaseResult(action, result.status, result.message, result.partnerId, result.listingId);
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

      {application.source === "admin_created" ? (
        <>
          <label>
            Assign existing partner
            <select value={selectedPartnerId} onChange={(event) => setSelectedPartnerId(event.target.value)}>
              <option value="">Select a partner</option>
              {availableOwners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.businessName} · {owner.status} · {owner.verificationStatus}
                </option>
              ))}
            </select>
          </label>
          <div className="applicationDecisionActions">
            <button
              type="button"
              disabled={isPending || !selectedPartnerId}
              onClick={() => {
                startTransition(async () => {
                  const result = await assignExistingPartnerToApplication({
                    applicationId: application.id,
                    partnerId: selectedPartnerId,
                    reviewer
                  });
                  if (!result.ok) {
                    setMessage(result.message);
                    return;
                  }
                  applyLinkedPartner(selectedPartnerId, undefined, result.message);
                });
              }}
            >
              Assign owner
            </button>
          </div>

          <label>
            Owner name
            <input value={ownerName} onChange={(event) => setOwnerName(event.target.value)} />
          </label>
          <label>
            Owner email
            <input value={ownerEmail} onChange={(event) => setOwnerEmail(event.target.value)} />
          </label>
          <div className="applicationDecisionActions">
            <button
              type="button"
              disabled={isPending || !ownerEmail.trim()}
              onClick={() => {
                startTransition(async () => {
                  const result = await inviteApplicationOwner({
                    applicationId: application.id,
                    reviewer,
                    ownerName,
                    ownerEmail
                  });
                  if (!result.ok) {
                    setMessage(result.message);
                    return;
                  }
                  const linkedPartnerId = typeof result.data === "object" && result.data && !Array.isArray(result.data) && typeof result.data.partnerId === "string"
                    ? result.data.partnerId
                    : "";
                  if (linkedPartnerId) {
                    setSelectedPartnerId(linkedPartnerId);
                    applyLinkedPartner(linkedPartnerId, ownerName || undefined, result.message);
                  } else {
                    setMessage(result.message);
                  }
                });
              }}
            >
              Invite owner
            </button>
          </div>
        </>
      ) : null}

      {application.source === "partner_submitted" ? (
        <>
          <label>
            Link to existing business
            <select value={selectedListingId} onChange={(event) => setSelectedListingId(event.target.value)}>
              <option value="">Select an existing {application.listingWorkflow}</option>
              {availableListings.map((listing) => (
                <option key={listing.id} value={listing.id}>
                  {listing.name} ({listing.slug}) · {listing.verificationStatus} · {listing.publicationStatus}
                </option>
              ))}
            </select>
          </label>
          <div className="applicationDecisionActions">
            <button
              type="button"
              disabled={isPending || !selectedListingId}
              onClick={() => {
                startTransition(async () => {
                  const result = await linkExistingBusinessToApplication({
                    applicationId: application.id,
                    listingId: selectedListingId
                  });
                  if (!result.ok) {
                    setMessage(result.message);
                    return;
                  }
                  applyLinkedListing(selectedListingId, result.message);
                });
              }}
            >
              Link existing business
            </button>
          </div>
        </>
      ) : null}

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
