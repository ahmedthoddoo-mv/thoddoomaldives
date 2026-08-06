import { EmailFooter, EmailLayout, EmailSection } from "@/lib/email/templates/shared";
import type { EmailContent } from "@/lib/email/types";

export function buildPartnerPendingEmail(input: {
  businessName: string;
  supportEmail: string;
  siteUrl: string;
}): EmailContent {
  const subject = `${input.businessName} is under review`;
  const text = [
    `Your partner account for ${input.businessName} is currently under review.`,
    `If you need help, contact ${input.supportEmail}.`,
  ].join("\n");

  const html = (
    <EmailLayout title="Partner account pending review" preheader="Your account is being reviewed by the team.">
      <EmailSection>
        <p>Your partner account for <strong>{input.businessName}</strong> is currently under review.</p>
        <p>We will let you know once the review is complete.</p>
        <p>If you need help, contact <strong>{input.supportEmail}</strong>.</p>
      </EmailSection>
      <EmailFooter>
        Site: {input.siteUrl.replace(/^https?:\/\//, "")}
      </EmailFooter>
    </EmailLayout>
  );

  return { subject, text, html };
}
