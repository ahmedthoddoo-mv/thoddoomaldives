import type { PartnerApplicationRecord } from "@/types/partner-application";

type MessageKind = "received" | "changes" | "approved" | "rejected" | "published";

const labels: Record<MessageKind, string> = {
  received: "Application received",
  changes: "Changes requested",
  approved: "Application approved",
  rejected: "Application rejected",
  published: "Listing published"
};

function buildPreview(application: PartnerApplicationRecord, kind: MessageKind) {
  const base = [`Hi ${application.contactPerson},`, ""];

  if (kind === "received") {
    return [...base, `We received the ${application.businessName} partner application and will review it shortly.`].join("\n");
  }

  if (kind === "changes") {
    return [
      ...base,
      `We reviewed ${application.businessName} and need a few updates before approval:`,
      ...application.requestedChanges.map((change) => `- ${change}`),
      "",
      "Please update and resubmit from the partner portal."
    ].join("\n");
  }

  if (kind === "approved") {
    return [...base, `${application.businessName} has been approved as an iThoddoo Growth Partner. Your listing is still controlled separately.`].join("\n");
  }

  if (kind === "published") {
    return [...base, `${application.businessName} is now published on iThoddoo Maldives. Travelers can view the listing and send booking inquiries.`].join("\n");
  }

  return [...base, `Thanks for applying. We cannot approve ${application.businessName} at this stage.`].join("\n");
}

export function ApplicationMessagePreview({ application }: { application: PartnerApplicationRecord }) {
  const kinds: MessageKind[] = ["received", "changes", "approved", "rejected", "published"];

  return (
    <section className="adminPanel">
      <div className="adminSectionHeader">
        <p className="eyebrow">Preview only</p>
        <h2>Email and WhatsApp templates</h2>
      </div>
      <div className="applicationMessageGrid">
        {kinds.map((kind) => (
          <article key={kind}>
            <strong>{labels[kind]}</strong>
            <pre>{buildPreview(application, kind)}</pre>
          </article>
        ))}
      </div>
    </section>
  );
}
