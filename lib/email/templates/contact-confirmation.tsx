import { EmailFooter, EmailLayout, EmailSection } from "@/lib/email/templates/shared";
import type { EmailContent } from "@/lib/email/types";

export function buildContactConfirmationEmail(input: {
  name: string;
  siteUrl: string;
  supportEmail: string;
  summary: string;
}): EmailContent {
  const subject = `We received your message`;
  const text = [
    `Thanks ${input.name || "for getting in touch"} — we received your message.`,
    input.summary,
    `Support: ${input.supportEmail}`,
  ].join("\n");

  const html = (
    <EmailLayout title="Message received" preheader="We received your enquiry.">
      <EmailSection>
        <p>Thanks {input.name ? <strong>{input.name}</strong> : "for getting in touch"} — we received your message.</p>
        <p>{input.summary}</p>
      </EmailSection>
      <EmailFooter>
        Support: {input.supportEmail} · Site: {input.siteUrl.replace(/^https?:\/\//, "")}
      </EmailFooter>
    </EmailLayout>
  );

  return { subject, text, html };
}
