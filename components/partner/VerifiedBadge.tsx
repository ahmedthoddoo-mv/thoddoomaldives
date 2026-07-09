type VerifiedBadgeProps = {
  label?: string;
};

export function VerifiedBadge({ label = "Verified" }: VerifiedBadgeProps) {
  return (
    <span className="verifiedBadge" aria-label={label}>
      <span aria-hidden="true">✓</span>
      {label}
    </span>
  );
}
