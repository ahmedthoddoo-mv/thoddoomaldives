import type { PartnerApplicationRecord } from "@/types/partner-application";
import { createVerificationDocuments, getVerificationCompletion } from "@/types/verification-documents";

export function ApplicationVerificationChecklist({ application }: { application: PartnerApplicationRecord }) {
  const documents =
    application.verificationDocuments && application.verificationDocuments.length > 0
      ? application.verificationDocuments
      : createVerificationDocuments(application.businessType);
  const completion = application.verificationCompletion ?? getVerificationCompletion(documents);

  return (
    <section className="adminPanel applicationVerificationPanel">
      <div className="adminSectionHeader">
        <p className="eyebrow">Verification</p>
        <h2>Document checklist</h2>
      </div>
      <div className="verificationCompletionBar" aria-label="Verification completion">
        <span style={{ width: `${completion}%` }} />
      </div>
      <p className="mutedText">{completion}% complete. Documents are private and visible only to admin review workflows.</p>
      <div className="applicationVerificationList">
        {documents.map((document) => {
          const submitted = Boolean(document.fileName || document.storagePathOrNote);
          return (
            <article key={document.key}>
              <div>
                <strong>{document.label}</strong>
                <span>{document.required ? "Required" : "Optional / where applicable"}</span>
              </div>
              <span className={`adminContentStatus ${submitted ? "adminContentStatusVerified" : "adminContentStatusPending"}`}>
                {submitted ? document.status : "missing"}
              </span>
              <p>{document.fileName || document.storagePathOrNote || "No private document reference submitted yet."}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
