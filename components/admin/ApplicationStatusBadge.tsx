import { getPartnerApplicationStatusLabel } from "@/data/partnerApplications";
import type { PartnerApplicationStatus } from "@/types/partner-application";

const statusTone: Record<PartnerApplicationStatus, string> = {
  draft: "neutral",
  submitted: "gold",
  under_review: "teal",
  changes_requested: "coral",
  approved: "green",
  rejected: "red",
  withdrawn: "neutral"
};

export function ApplicationStatusBadge({ status }: { status: PartnerApplicationStatus }) {
  return (
    <span className={`applicationStatusBadge applicationStatusBadge-${statusTone[status]}`}>
      {getPartnerApplicationStatusLabel(status)}
    </span>
  );
}
