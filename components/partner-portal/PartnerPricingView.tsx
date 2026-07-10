import { partnerMembershipPlans } from "@/data/partnerPortal";

export function PartnerPricingView() {
  const featureRows = ["Basic profile", "Verified badge", "Analytics dashboard", "Featured placement", "Custom reporting"];

  return (
    <div className="partnerPortalStack">
      <section className="partnerPortalPlanGrid">
        {partnerMembershipPlans.map((plan) => (
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
            {partnerMembershipPlans.map((plan) => (
              <strong key={plan.name}>{plan.name}</strong>
            ))}
          </div>
          {featureRows.map((feature) => (
            <div key={feature}>
              <span>{feature}</span>
              {partnerMembershipPlans.map((plan) => (
                <span key={plan.name}>{plan.features.includes(feature) ? "Included" : "Upgrade"}</span>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
