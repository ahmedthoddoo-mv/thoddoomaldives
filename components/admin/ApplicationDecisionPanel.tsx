"use client";

import { useState } from "react";
import { requestedChangeOptions } from "@/data/partnerApplications";
import { PartnerApplicationRepository } from "@/lib/applications/partnerApplicationRepository";
import type { PartnerApplicationRecord } from "@/types/partner-application";

type ApplicationDecisionPanelProps = {
  application: PartnerApplicationRecord;
  onChange: (application: PartnerApplicationRecord) => void;
};

export function ApplicationDecisionPanel({ application, onChange }: ApplicationDecisionPanelProps) {
  const [reviewer, setReviewer] = useState(application.assignedReviewer || "Ahmed");
  const [note, setNote] = useState("");
  const [selectedChanges, setSelectedChanges] = useState<string[]>(application.requestedChanges);
  const [message, setMessage] = useState("");

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
          onClick={() => applyResult(PartnerApplicationRepository.startReview(application.id, reviewer || "Admin"))}
        >
          Start review
        </button>
        <button type="button" onClick={() => applyResult(PartnerApplicationRepository.approve(application.id, false))}>
          Approve and draft listing
        </button>
        <button type="button" onClick={() => applyResult(PartnerApplicationRepository.approve(application.id, true))}>
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
        <textarea value={note} rows={4} onChange={(event) => setNote(event.target.value)} />
      </label>

      <div className="applicationDecisionActions">
        <button
          type="button"
          onClick={() => applyResult(PartnerApplicationRepository.requestChanges(application.id, selectedChanges, note))}
        >
          Request changes
        </button>
        <button type="button" onClick={() => applyResult(PartnerApplicationRepository.reject(application.id, note))}>
          Reject
        </button>
        <button type="button" onClick={() => applyResult(PartnerApplicationRepository.reopen(application.id))}>
          Reopen
        </button>
      </div>

      {message ? <p className="propertySaveStatus propertySaveStatusSuccess">{message}</p> : null}
    </section>
  );
}
