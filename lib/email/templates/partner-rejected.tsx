import { EmailButton, EmailFooter, EmailLayout, EmailSection } from "@/lib/email/templates/shared";
import type { EmailContent } from "@/lib/email/types";

export function buildPartnerRejectedEmail(input: {
  businessName: string;
  supportEmail: string;
  siteUrl: string;
  reason?: string;
}): EmailContent {
  const subject = `Update on your partner application`;
  const text = [
    `We reviewed the partner application for ${input.businessName}.`,
    input.reason ? `Reason: ${input.reason}` : "The application was not approved at this time.",
    `Support: ${input.supportEmail}`,
  ].join("\n");

  const html = (
    <EmailLayout title="Partner application update" preheader="There is an update on your partner application.">
      <EmailSection>
        <p>We reviewed the application for <strong>{input.businessName}</strong>.</p>
        <p>{input.reason ?? "The application was not approved at this time."}</p>
        <p>If you would like help with the next steps, contact <strong>{input.supportEmail}</strong>.</p>
        <EmailButton href={`mailto:${input.supportEmail}`}>Email support</EmailButton>
      </EmailSection>
      <EmailFooter>
        Site: {input.siteUrl.replace(/^https?:\/\//, "")}
      </EmailFooter>
    </EmailLayout>
  );

  return { subject, text, html };
}
