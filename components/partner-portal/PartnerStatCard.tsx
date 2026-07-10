import type { PartnerPortalStat } from "@/data/partnerPortal";

export function PartnerStatCard({ stat }: { stat: PartnerPortalStat }) {
  return (
    <article className={`partnerPortalCard partnerPortalStat partnerTone-${stat.tone ?? "teal"}`}>
      <span>{stat.label}</span>
      <strong>{stat.value}</strong>
      <p>{stat.detail}</p>
    </article>
  );
}
