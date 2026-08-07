import { getPartnerApplicationBusinessTypeLabel } from "@/data/partnerApplications";
import { ApplicationStatusBadge } from "@/components/admin/ApplicationStatusBadge";
import type { PartnerApplicationRecord } from "@/types/partner-application";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function ApplicationSummaryCard({ application }: { application: PartnerApplicationRecord }) {
  const sourceLabel = application.source === "admin_created" ? "Admin created" : "Partner submitted";
  const ownerLabel = application.linkedPartnerName || application.contactPerson || "Not assigned";

  return (
    <a className="applicationSummaryCard" href={`/admin/applications/${application.id}`}>
      <div>
        <span>{getPartnerApplicationBusinessTypeLabel(application.businessType)}</span>
        <ApplicationStatusBadge
          status={application.status}
          source={application.source}
          linkedPartnerId={application.linkedPartnerId}
        />
      </div>
      <strong>{application.businessName}</strong>
      <p>{application.description}</p>
      <dl>
        <div>
          <dt>Source</dt>
          <dd>{sourceLabel}</dd>
        </div>
        <div>
          <dt>Owner</dt>
          <dd>{ownerLabel}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{application.verificationStatus}</dd>
        </div>
        <div>
          <dt>Publication</dt>
          <dd>{application.listingPublicationStatus}</dd>
        </div>
        <div>
          <dt>Submitted</dt>
          <dd>{formatDate(application.submittedDate)}</dd>
        </div>
      </dl>
    </a>
  );
}
