import type { MembershipTier } from "@/types/membership";
import type { PartnerVerificationStatus } from "@/types/partner";
import { VerifiedBadge } from "./VerifiedBadge";

type PartnerBadgeProps = {
  tier: MembershipTier;
  verificationStatus?: PartnerVerificationStatus;
};

const tierLabels: Record<MembershipTier, string> = {
  free: "Free",
  verified: "Verified Growth",
  premium: "Premium Growth"
};

export function PartnerBadge({ tier, verificationStatus }: PartnerBadgeProps) {
  if (verificationStatus === "verified") {
    return <VerifiedBadge label={tier === "premium" ? "Premium Verified" : "Verified"} />;
  }

  return <span className={`tierBadge tierBadge-${tier}`}>{tierLabels[tier]}</span>;
}
