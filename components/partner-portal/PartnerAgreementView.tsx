import type { PartnerPortalData } from '@/lib/partner-portal/partnerAccess';

export function PartnerAgreementView({ portalData }: { portalData: PartnerPortalData }) {
  return (
    <div className="partnerPortalStack">
      <section className="partnerPortalPanel">
        <div className="partnerPortalSectionHeader">
          <p className="eyebrow">Agreement status</p>
          <h2>{portalData.agreementStatus.label}</h2>
        </div>
        <p>{portalData.agreementStatus.message}</p>
        <div className="partnerPortalSnapshotGrid" style={{ marginTop: '16px' }}>
          <div>
            <span>Current state</span>
            <strong>{portalData.agreementStatus.state}</strong>
            <small>{portalData.agreementStatus.detail}</small>
          </div>
          <div>
            <span>Next step</span>
            <strong>{portalData.agreementStatus.nextStep}</strong>
            <small>Read-only foundation for future acceptance flow</small>
          </div>
        </div>
      </section>
    </div>
  );
}
