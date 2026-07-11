import { getPartnerApplicationBusinessTypeLabel } from "@/data/partnerApplications";
import { ApplicationStatusBadge } from "@/components/admin/ApplicationStatusBadge";
import type { PartnerApplicationRecord } from "@/types/partner-application";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function ApplicationSummaryCard({ application }: { application: PartnerApplicationRecord }) {
  return (
    <a className="applicationSummaryCard" href={`/admin/applications/${application.id}`}>
      <div>
        <span>{getPartnerApplicationBusinessTypeLabel(application.businessType)}</span>
        <ApplicationStatusBadge status={application.status} />
      </div>
      <strong>{application.businessName}</strong>
      <p>{application.description}</p>
      <dl>
        <div>
          <dt>Plan</dt>
          <dd>{application.requestedMembershipTier}</dd>
        </div>
        <div>
          <dt>Submitted</dt>
          <dd>{formatDate(application.submittedDate)}</dd>
        </div>
      </dl>
    </a>
  );
}
