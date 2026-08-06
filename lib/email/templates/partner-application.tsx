import { EmailButton, EmailFooter, EmailLayout, EmailSection } from "@/lib/email/templates/shared";
import type { EmailContent } from "@/lib/email/types";

export function buildPartnerApplicationEmail(input: {
  businessName: string;
  reference: string;
  reviewLink: string;
  siteUrl: string;
}): EmailContent {
  const subject = `We received your partner application for ${input.businessName}`;
  const text = [
    `Thanks for applying to partner with iThoddoo Maldives.`,
    "",
    `Business: ${input.businessName}`,
    `Application ID: ${input.reference}`,
    "",
    `We will review the application and reply with next steps.`,
    `Review link: ${input.reviewLink}`,
  ].join("\n");

  const html = (
    <EmailLayout title="Partner application received" preheader="Your partner application is in review.">
      <EmailSection>
        <p>Thanks for applying to partner with iThoddoo Maldives.</p>
        <p><strong>Business:</strong> {input.businessName}</p>
        <p><strong>Application ID:</strong> {input.reference}</p>
        <p>We will review your details and email the next steps.</p>
        <EmailButton href={input.reviewLink}>View review status</EmailButton>
      </EmailSection>
      <EmailFooter>
        This message was sent from {input.siteUrl.replace(/^https?:\/\//, "")}.
      </EmailFooter>
    </EmailLayout>
  );

  return { subject, text, html };
}
