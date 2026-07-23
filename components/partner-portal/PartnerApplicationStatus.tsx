"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getPartnerApplicationBusinessTypeLabel } from "@/data/partnerApplications";
import { ApplicationStatusBadge } from "@/components/admin/ApplicationStatusBadge";
import { ApplicationTimeline } from "@/components/admin/ApplicationTimeline";
import { RequestedChangesList } from "@/components/admin/RequestedChangesList";
import {
  PartnerApplicationRepository,
  subscribeToPartnerApplications
} from "@/lib/applications/partnerApplicationRepository";
import type { PartnerApplicationRecord } from "@/types/partner-application";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function PartnerApplicationStatus() {
  const [applications, setApplications] = useState<PartnerApplicationRecord[]>(() =>
    PartnerApplicationRepository.findAll()
  );
  const [resubmitNote, setResubmitNote] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => subscribeToPartnerApplications(() => setApplications(PartnerApplicationRepository.findAll())), []);

  const application = useMemo(
    () =>
      applications.find((item) => item.status === "changes_requested") ??
      applications.find((item) => item.status !== "rejected" && item.status !== "withdrawn") ??
      applications[0],
    [applications]
  );

  function handleResubmit() {
    if (!application) {
      return;
    }

    const result = PartnerApplicationRepository.resubmit(application.id, resubmitNote);
    if (result) {
      setApplications(PartnerApplicationRepository.findAll());
      setResubmitNote("");
      setMessage("Application resubmitted to the admin review queue.");
    }
  }

  if (!application) {
    return (
      <section className="partnerPortalPanel">
        <h2>No application yet</h2>
        <p>Submit the partner onboarding form to create a demo review record.</p>
        <Link className="primaryButton" href="/partners/onboarding">
          Start application
        </Link>
      </section>
    );
  }

  const isEditable = application.status === "changes_requested";

  return (
    <div className="partnerPortalStack">
      <section className="partnerPortalPanel partnerApplicationHero">
        <div>
          <ApplicationStatusBadge status={application.status} />
          <h2>{application.businessName}</h2>
          <p>{application.description}</p>
        </div>
        <dl>
          <div>
            <dt>Business type</dt>
            <dd>{getPartnerApplicationBusinessTypeLabel(application.businessType)}</dd>
          </div>
          <div>
            <dt>Membership</dt>
            <dd>{application.requestedMembershipTier}</dd>
          </div>
          <div>
            <dt>Submitted</dt>
            <dd>{formatDate(application.submittedDate)}</dd>
          </div>
          <div>
            <dt>Listing</dt>
            <dd>{application.listingPublicationStatus}</dd>
          </div>
        </dl>
      </section>

      <section className="partnerPortalPanel">
        <h2>Admin feedback</h2>
        <RequestedChangesList changes={application.requestedChanges} />
        {application.adminNotes.length > 0 ? (
          <ul className="requestedChangesList">
            {application.adminNotes.map((note, index) => (
              <li key={`${note}-${index}`}>{note}</li>
            ))}
          </ul>
        ) : null}
      </section>

      {isEditable ? (
        <section className="partnerPortalPanel">
          <h2>Edit and resubmit</h2>
          <p>Add a short update for the admin team. Full listing editing will be enabled after approval.</p>
          <textarea
            value={resubmitNote}
            rows={5}
            onChange={(event) => setResubmitNote(event.target.value)}
            placeholder="Example: Photos and prices are ready. Updated description attached."
          />
          <button className="primaryButton" type="button" onClick={handleResubmit}>
            Resubmit application
          </button>
          {message ? <p className="propertySaveStatus propertySaveStatusSuccess">{message}</p> : null}
        </section>
      ) : (
        <section className="partnerPortalPanel">
          <h2>Next steps</h2>
          <p>
            {application.status === "approved"
              ? "Your application is approved. Listing publication is controlled separately by the admin team."
              : "The admin team will review your application and contact you if anything is missing."}
          </p>
        </section>
      )}

      <section className="partnerPortalPanel">
        <h2>Application timeline</h2>
        <ApplicationTimeline timeline={application.timeline} />
      </section>
    </div>
  );
}
