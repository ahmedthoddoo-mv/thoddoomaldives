import type { CrmMembership, CrmPartnerStatus, CrmPriority, CrmTaskStatus, CrmTaskType, CrmVerification } from "@/data/adminCrm";

type AdminCrmStatusBadgeProps = {
  label: CrmPartnerStatus | CrmPriority | CrmVerification | CrmMembership | CrmTaskStatus | CrmTaskType;
};

export function AdminCrmStatusBadge({ label }: AdminCrmStatusBadgeProps) {
  const className =
    label === "Verified" || label === "Completed" || label === "Premium" || label === "Enterprise"
      ? "adminContentStatusHealthy"
      : label === "High" || label === "Urgent" || label === "Waiting Response"
        ? "adminContentStatusReview"
        : label === "Pending" || label === "In Progress" || label === "Medium"
          ? "adminContentStatusDraft"
          : "adminContentStatusMuted";

  return <span className={`adminContentStatus ${className}`}>{label}</span>;
}
