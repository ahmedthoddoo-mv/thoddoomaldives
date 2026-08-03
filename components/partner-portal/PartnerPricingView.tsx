import type { PartnerMembershipPlan } from "@/data/partnerPortal";

// Fixture plans are only used in explicit mock/demo mode.
// In Supabase mode the component receives live plans (or an empty array).
function getMockPlans(): PartnerMembershipPlan[] {
  if (process.env.NEXT_PUBLIC_DATA_MODE !== "mock") return [];
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("@/data/partnerPortal").partnerMembershipPlans as PartnerMembershipPlan[];
}

type Props = {
  plans?: PartnerMembershipPlan[];
};

export function PartnerPricingView({ plans }: Props) {
  const resolvedPlans = plans ?? getMockPlans();
  const featureRows = ["Basic profile", "Verified badge", "Analytics dashboard", "Featured placement", "Custom reporting"];

  if (resolvedPlans.length === 0) {
    return (
      <div className="partnerPortalStack">
        <section className="partnerPortalPanel">
          <div className="partnerPortalSectionHeader">
            <p className="eyebrow">Membership</p>
            <h2>Membership Plans</h2>
          </div>
          <p>Membership plan information is not currently available. Please contact support for details about your current plan.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="partnerPortalStack">
      <section className="partnerPortalPlanGrid">
        {resolvedPlans.map((plan) => (
          <article className={`partnerPortalPanel partnerPortalPlan ${plan.current ? "partnerPortalPlanCurrent" : ""}`} key={plan.name}>
            {plan.current ? <span>Current plan</span> : null}
            <h2>{plan.name}</h2>
            <strong>{plan.price}</strong>
            <p>{plan.description}</p>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="partnerPortalPanel">
        <div className="partnerPortalSectionHeader">
          <p className="eyebrow">Membership</p>
          <h2>Feature Comparison</h2>
        </div>
        <div className="partnerPortalComparison">
          <div>
            <strong>Feature</strong>
            {resolvedPlans.map((plan) => (
              <strong key={plan.name}>{plan.name}</strong>
            ))}
          </div>
          {featureRows.map((feature) => (
            <div key={feature}>
              <span>{feature}</span>
              {resolvedPlans.map((plan) => (
                <span key={plan.name}>{plan.features.includes(feature) ? "Included" : "Upgrade"}</span>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
