"use client";

import { useEffect, useState } from "react";
import { getPartnerApplicationBusinessTypeLabel } from "@/data/partnerApplications";
import { ApplicationDecisionPanel } from "@/components/admin/ApplicationDecisionPanel";
import { ApplicationMessagePreview } from "@/components/admin/ApplicationMessagePreview";
import { ApplicationStatusBadge } from "@/components/admin/ApplicationStatusBadge";
import { ApplicationTimeline } from "@/components/admin/ApplicationTimeline";
import { ApplicationVerificationChecklist } from "@/components/admin/ApplicationVerificationChecklist";
import { RequestedChangesList } from "@/components/admin/RequestedChangesList";
import {
  PartnerApplicationRepository,
  subscribeToPartnerApplications
} from "@/lib/applications/partnerApplicationRepository";
import type { PartnerApplicationRecord } from "@/types/partner-application";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function ApplicationDetailPanel({
  applicationId,
  initialApplication,
  dataSource
}: {
  applicationId: string;
  initialApplication?: PartnerApplicationRecord;
  dataSource?: "mock" | "supabase" | "fallback";
}) {
  const [application, setApplication] = useState<PartnerApplicationRecord | undefined>(() =>
    initialApplication ?? PartnerApplicationRepository.findById(applicationId)
  );

  useEffect(() => {
    if (initialApplication) {
      setApplication(initialApplication);
      return () => undefined;
    }

    setApplication(PartnerApplicationRepository.findById(applicationId));
    return subscribeToPartnerApplications(() => setApplication(PartnerApplicationRepository.findById(applicationId)));
  }, [applicationId, initialApplication]);

  if (!application) {
    return (
      <section className="adminPanel">
        <h1>Application not found</h1>
        <p className="mutedText">The application may be stored in another browser session or has been reset.</p>
        <a className="adminContentAddButton" href="/admin/applications">
          Back to applications
        </a>
      </section>
    );
  }

  return (
    <div className="adminCrmStack">
      <section className="adminContentHero">
        <div>
          <ApplicationStatusBadge status={application.status} />
          <h1>{application.businessName}</h1>
          <p>{application.description}</p>
          {dataSource === "supabase" ? <p className="mutedText">Loaded from Supabase onboarding submissions.</p> : null}
          {dataSource === "fallback" ? <p className="mutedText">Supabase unavailable. Showing safe demo application data.</p> : null}
        </div>
        <a className="adminContentAddButton" href="/admin/applications">
          Back to queue
        </a>
      </section>

      <div className="adminTwoColumn">
        <section className="adminPanel applicationDetailPanel">
          <div className="adminSectionHeader">
            <p className="eyebrow">Application profile</p>
            <h2>Submitted details</h2>
          </div>
          <dl className="applicationDetailGrid">
            <div>
              <dt>Business type</dt>
              <dd>{getPartnerApplicationBusinessTypeLabel(application.businessType)}</dd>
            </div>
            <div>
              <dt>Owner/contact</dt>
              <dd>{application.contactPerson}</dd>
            </div>
            <div>
              <dt>WhatsApp</dt>
              <dd>{application.whatsapp}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{application.email}</dd>
            </div>
            <div>
              <dt>Island</dt>
              <dd>{application.island}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>{application.address}</dd>
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
              <dt>Listing workflow</dt>
              <dd>{application.listingWorkflow}</dd>
            </div>
            <div>
              <dt>Listing status</dt>
              <dd>{application.listingPublicationStatus}</dd>
            </div>
            <div>
              <dt>Linked partner</dt>
              <dd>{application.linkedPartnerId ?? "Not created"}</dd>
            </div>
            <div>
              <dt>Linked listing</dt>
              <dd>{application.linkedListingId ?? "Not created"}</dd>
            </div>
          </dl>
          <h3>Services</h3>
          <p>{application.services}</p>
          <h3>Media notes</h3>
          <p>{application.mediaNotes || "No media notes submitted."}</p>
          <h3>Requested changes</h3>
          <RequestedChangesList changes={application.requestedChanges} />
        </section>

        <ApplicationDecisionPanel application={application} onChange={setApplication} dataSource={dataSource} />
      </div>

      <ApplicationVerificationChecklist application={application} />

      <section className="adminPanel">
        <div className="adminSectionHeader">
          <p className="eyebrow">History</p>
          <h2>Timeline</h2>
        </div>
        <ApplicationTimeline timeline={application.timeline} />
      </section>

      <ApplicationMessagePreview application={application} />
    </div>
  );
}
