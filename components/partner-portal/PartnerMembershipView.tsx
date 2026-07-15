import { partnerMembershipPlans } from "@/data/partnerPortal";
import type { PartnerPortalData } from "@/lib/partner-portal/partnerAccess";

export function PartnerMembershipView({ portalData }: { portalData: PartnerPortalData }) {
  return (
    <div className="partnerPortalStack">
      <section className="partnerPortalPanel">
        <div className="partnerPortalSectionHeader">
          <p className="eyebrow">Current plan</p>
          <h2>{portalData.membership.plan}</h2>
        </div>
        <div className="partnerPortalSnapshotGrid">
          <div>
            <span>Status</span>
            <strong>{portalData.membership.status}</strong>
            <small>Membership record</small>
          </div>
          <div>
            <span>Renewal Date</span>
            <strong>{portalData.membership.renewalDate}</strong>
            <small>Demo billing schedule</small>
          </div>
          <div>
            <span>Invoices</span>
            <strong>Placeholder</strong>
            <small>Payment integration later</small>
          </div>
        </div>
        <div className="partnerPortalActions">
          <button type="button">Upgrade Plan</button>
        </div>
      </section>

      <section className="partnerPortalPlanGrid">
        {partnerMembershipPlans.map((plan) => (
          <article className={`partnerPortalPanel partnerPortalPlan ${plan.name === portalData.membership.plan ? "partnerPortalPlanCurrent" : ""}`} key={plan.name}>
            {plan.name === portalData.membership.plan ? <span>Current plan</span> : null}
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
    </div>
  );
}
