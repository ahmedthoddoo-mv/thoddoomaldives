"use client";

import { useState } from "react";
import Link from "next/link";
import { getPartnerApplicationBusinessTypeLabel } from "@/data/partnerApplications";
import { ApplicationDecisionPanel } from "@/components/admin/ApplicationDecisionPanel";
import { ApplicationMessagePreview } from "@/components/admin/ApplicationMessagePreview";
import { ApplicationStatusBadge } from "@/components/admin/ApplicationStatusBadge";
import { ApplicationTimeline } from "@/components/admin/ApplicationTimeline";
import { ApplicationVerificationChecklist } from "@/components/admin/ApplicationVerificationChecklist";
import { RequestedChangesList } from "@/components/admin/RequestedChangesList";
import { ApplicationReviewEditor } from "@/components/admin/ApplicationReviewEditor";
import { getApplicationOwnerState } from "@/lib/applications/ownerState";
import type { PartnerApplicationRecord } from "@/types/partner-application";

type OwnerOption = {
  id: string;
  businessName: string;
  status: string;
  verificationStatus: string;
};

type ListingOption = {
  id: string;
  name: string;
  slug: string;
  publicationStatus: string;
  verificationStatus: string;
  applicationId?: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function ApplicationDetailPanel({
  initialApplication,
  dataSource,
  readError,
  availableOwners,
  availableListings
}: {
  initialApplication?: PartnerApplicationRecord;
  dataSource?: "mock" | "supabase" | "supabase_error";
  readError?: string;
  availableOwners: OwnerOption[];
  availableListings: ListingOption[];
}) {
  const [applicationOverride, setApplicationOverride] = useState<PartnerApplicationRecord>();
  const application = applicationOverride ?? initialApplication;
  const ownerState = application ? getApplicationOwnerState(application) : null;

  if (!application) {
    return (
      <section className="adminPanel">
        <h1>Application not found</h1>
        <p className="mutedText">No application with this ID was returned by the live data source.</p>
        <Link className="adminContentAddButton" href="/admin/applications">
          Back to applications
        </Link>
      </section>
    );
  }

  return (
    <div className="adminCrmStack">
      <section className="adminContentHero">
        <div>
          <ApplicationStatusBadge
            status={application.status}
            source={application.source}
            linkedPartnerId={application.linkedPartnerId}
          />
          <h1>{application.businessName}</h1>
          <p>{application.description}</p>
          {dataSource === "supabase" ? <p className="mutedText">Data source: Supabase</p> : null}
          {dataSource === "mock" ? <p className="mutedText">Data source: Mock</p> : null}
          {dataSource === "supabase_error" ? (
            <p className="bookingValidationPanel">Data source: Supabase unavailable. {readError ?? "Check migrations and service role configuration."}</p>
          ) : null}
        </div>
        <Link className="adminContentAddButton" href="/admin/applications">
          Back to queue
        </Link>
      </section>

      <div className="adminTwoColumn">
        <section className="adminPanel applicationDetailPanel">
          {ownerState ? (
            <div className="adminPanel applicationOwnerSummary">
              <div className="adminSectionHeader">
                <p className="eyebrow">Owner status</p>
                <h2>{ownerState.title}</h2>
              </div>
              <p>{ownerState.detail}</p>
              {application.linkedPartnerName ? <p><strong>Linked partner:</strong> {application.linkedPartnerName}</p> : null}
              {application.ownerInvitationStatus === "pending" && application.email ? <p><strong>Invited owner:</strong> {application.email}</p> : null}
            </div>
          ) : null}
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
              <dt>Source</dt>
              <dd>{application.source === "admin_created" ? "Admin created" : "Partner submitted"}</dd>
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
              <dd>{application.linkedPartnerName || application.linkedPartnerId || "Not assigned"}</dd>
            </div>
            <div>
              <dt>Linked listing</dt>
              <dd>{application.linkedListingId ?? "Not created"}</dd>
            </div>
          </dl>
          {application.linkedListingId ? (
            <p>
              <Link
                href={
                  application.listingWorkflow === "property"
                    ? `/admin/guesthouses/${application.linkedListingId}/edit`
                    : `/admin/${application.listingWorkflow}s/${application.linkedListingId}/edit`
                }
              >
                Edit business
              </Link>
            </p>
          ) : null}
          <h3>Services</h3>
          <p>{application.services}</p>
          {application.submittedFields?.length ? (
            <>
              <h3>Category details</h3>
              <dl className="applicationDetailGrid">
                {application.submittedFields.map((field) => (
                  <div key={field.label}>
                    <dt>{field.label}</dt>
                    <dd>{field.value}</dd>
                  </div>
                ))}
              </dl>
            </>
          ) : null}
          {application.pricingRows?.length ? (
            <>
              <h3>Submitted pricing</h3>
              <dl className="applicationDetailGrid">
                {application.pricingRows.map((price) => (
                  <div key={`${price.name}-${price.unit}`}>
                    <dt>{price.name}</dt>
                    <dd>{price.price} · {price.unit}</dd>
                  </div>
                ))}
              </dl>
            </>
          ) : null}
          {application.publicMedia?.length ? (
            <>
              <h3>Submitted public media</h3>
              <ul>
                {application.publicMedia.map((media) => <li key={media.label}>{media.label}: {media.status}</li>)}
              </ul>
            </>
          ) : null}
          <h3>Media notes</h3>
          <p>{application.mediaNotes || "No media notes submitted."}</p>
          <h3>Requested changes</h3>
          <RequestedChangesList changes={application.requestedChanges} />
        </section>

        <ApplicationDecisionPanel
          application={application}
          onChange={setApplicationOverride}
          dataSource={dataSource}
          availableOwners={availableOwners}
          availableListings={availableListings}
        />
      </div>

      <ApplicationVerificationChecklist application={application} />

      {dataSource === "supabase" ? <ApplicationReviewEditor application={application} /> : null}

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
