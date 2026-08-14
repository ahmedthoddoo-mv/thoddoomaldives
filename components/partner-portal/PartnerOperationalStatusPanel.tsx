import type { PartnerPortalData } from '@/lib/partner-portal/partnerAccess';

export function PartnerOperationalStatusPanel({ portalData }: { portalData: PartnerPortalData }) {
  const operational = portalData.operationalStatus;
  return (
    <section className="partnerPortalPanel" aria-label="Operational status overview">
      <div className="partnerPortalSectionHeader">
        <p className="eyebrow">Operational status</p>
        <h2>{operational.headline}</h2>
      </div>
      <div className="partnerPortalSnapshotGrid">
        <div>
          <span>Status</span>
          <strong>{operational.partnerStatus}</strong>
          <small>{operational.verificationStatus}</small>
        </div>
        <div>
          <span>Membership</span>
          <strong>{operational.membershipPlan}</strong>
          <small>{operational.subscriptionStatus}</small>
        </div>
        <div>
          <span>Complimentary</span>
          <strong>{operational.complimentaryStatus}</strong>
          <small>{operational.complimentaryRange}</small>
        </div>
        <div>
          <span>Remaining</span>
          <strong>{operational.daysRemainingText}</strong>
          <small>{operational.agreementStatus}</small>
        </div>
      </div>
      <div className="partnerPortalSnapshotGrid" style={{ marginTop: '12px' }}>
        <div>
          <span>Publication</span>
          <strong>{operational.publicationStatus}</strong>
          <small>{operational.requiresAction}</small>
        </div>
        <div>
          <span>Access</span>
          <strong>{operational.operationalAccess}</strong>
          <small>{operational.accessDetail}</small>
        </div>
      </div>
    </section>
  );
}
