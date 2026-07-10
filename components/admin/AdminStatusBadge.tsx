import type { PublicationStatus, VerificationStatus } from "@/data/adminCms";

type AdminStatusBadgeProps = {
  status: PublicationStatus | VerificationStatus | "Featured" | "Standard" | "Archived";
};

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  const className =
    status === "Published" || status === "Verified" || status === "Featured"
      ? "adminContentStatusHealthy"
      : status === "Pending" || status === "Draft"
        ? "adminContentStatusDraft"
        : status === "Archived"
          ? "adminContentStatusMuted"
          : "adminContentStatusReview";

  return <span className={`adminContentStatus ${className}`}>{status}</span>;
}
