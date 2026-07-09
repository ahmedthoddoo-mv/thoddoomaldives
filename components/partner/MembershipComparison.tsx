import type { MembershipFeature, MembershipPlan } from "@/types/membership";

type MembershipComparisonProps = {
  plans: MembershipPlan[];
  features: MembershipFeature[];
};

export function MembershipComparison({ plans, features }: MembershipComparisonProps) {
  return (
    <section className="section">
      <div className="sectionHeader">
        <p className="eyebrow">Membership plans</p>
        <h2>Reusable growth tiers for every partner category</h2>
      </div>
      <div className="comparisonTable" role="table" aria-label="Membership comparison">
        <div className="comparisonRow comparisonHead" role="row">
          <span role="columnheader">Capability</span>
          {plans.map((plan) => (
            <span key={plan.tier} role="columnheader">
              {plan.name}
            </span>
          ))}
        </div>
        {features.map((feature) => (
          <div className="comparisonRow" role="row" key={feature.id}>
            <span role="cell">
              <strong>{feature.label}</strong>
              <small>{feature.description}</small>
            </span>
            {plans.map((plan) => (
              <span key={plan.tier} role="cell" aria-label={`${feature.label} ${feature.includedIn.includes(plan.tier) ? "included" : "not included"} in ${plan.name}`}>
                {feature.includedIn.includes(plan.tier) ? "✓" : "—"}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
