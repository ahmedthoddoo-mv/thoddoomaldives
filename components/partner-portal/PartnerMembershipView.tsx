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
            <small>Database membership record</small>
          </div>
          <div>
            <span>Complimentary</span>
            <strong>{portalData.operationalStatus.complimentaryStatus}</strong>
            <small>{portalData.operationalStatus.complimentaryRange}</small>
          </div>
          <div>
            <span>Remaining</span>
            <strong>{portalData.operationalStatus.daysRemainingText}</strong>
            <small>{portalData.operationalStatus.subscriptionStatus}</small>
          </div>
        </div>
      </section>
    </div>
  );
}
