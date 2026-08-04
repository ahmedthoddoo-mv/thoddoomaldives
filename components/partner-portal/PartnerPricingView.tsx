import type { PartnerPortalData } from "@/lib/partner-portal/partnerAccess";

export function PartnerPricingView({ membership }: { membership: PartnerPortalData["membership"] }) {
  return (
    <section className="partnerPortalPanel">
      <div className="partnerPortalSectionHeader">
        <p className="eyebrow">Membership</p>
        <h2>{membership.plan}</h2>
      </div>
      <p>Status: {membership.status}</p>
      <p>Renewal: {membership.renewalDate}</p>
    </section>
  );
}
