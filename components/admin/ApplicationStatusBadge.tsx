import { getPartnerApplicationStatusLabel } from "@/data/partnerApplications";
import type { PartnerApplicationStatus, PartnerApplicationWorkflowSource } from "@/types/partner-application";

const statusTone: Record<PartnerApplicationStatus, string> = {
  draft: "neutral",
  submitted: "gold",
  under_review: "teal",
  changes_requested: "coral",
  approved: "green",
  rejected: "red",
  withdrawn: "neutral"
};

export function ApplicationStatusBadge({
  status,
  source,
  linkedPartnerId
}: {
  status: PartnerApplicationStatus;
  source?: PartnerApplicationWorkflowSource;
  linkedPartnerId?: string;
}) {
  const tone = source === "admin_created" && status === "submitted" && !linkedPartnerId
    ? "gold"
    : statusTone[status];

  return (
    <span className={`applicationStatusBadge applicationStatusBadge-${tone}`}>
      {getPartnerApplicationStatusLabel(status, { source, linkedPartnerId })}
    </span>
  );
}
