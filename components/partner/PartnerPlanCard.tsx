import type { MembershipPlan } from "@/types/membership";

type PartnerPlanCardProps = {
  plan: MembershipPlan;
};

export function PartnerPlanCard({ plan }: PartnerPlanCardProps) {
  return (
    <article className={`planCard ${plan.isRecommended ? "planCardRecommended" : ""}`}>
      {plan.isRecommended ? <span className="recommendationPill">Recommended</span> : null}
      <p className="eyebrow">{plan.tagline}</p>
      <h3>{plan.name}</h3>
      <p>{plan.description}</p>
      <ul>
        {plan.benefits.map((benefit) => (
          <li key={benefit}>{benefit}</li>
        ))}
      </ul>
    </article>
  );
}
