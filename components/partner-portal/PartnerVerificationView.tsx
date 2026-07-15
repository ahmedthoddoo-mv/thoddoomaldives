import type { PartnerPortalData } from "@/lib/partner-portal/partnerAccess";

export function PartnerVerificationView({ portalData }: { portalData: PartnerPortalData }) {
  return (
    <div className="partnerPortalStack">
      <section className="partnerPortalPanel">
        <div className="partnerPortalSectionHeader">
          <p className="eyebrow">Verification</p>
          <h2>{portalData.verification.status}</h2>
        </div>
        <div className="verificationCompletionBar" aria-label="Partner verification completion">
          <span style={{ width: `${portalData.verification.completion}%` }} />
        </div>
        <p>{portalData.verification.completion}% complete</p>
      </section>

      <div className="partnerPortalTwoColumn">
        <section className="partnerPortalPanel">
          <h2>Missing Documents</h2>
          {portalData.verification.missingDocuments.length > 0 ? (
            <ul className="requestedChangesList">
              {portalData.verification.missingDocuments.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>All required verification documents are submitted.</p>
          )}
        </section>
        <section className="partnerPortalPanel">
          <h2>Admin Notes</h2>
          {portalData.verification.adminNotes.length > 0 ? (
            <ul className="requestedChangesList">
              {portalData.verification.adminNotes.map((note, index) => (
                <li key={`${note}-${index}`}>{note}</li>
              ))}
            </ul>
          ) : (
            <p>No admin notes at the moment.</p>
          )}
        </section>
      </div>
    </div>
  );
}
