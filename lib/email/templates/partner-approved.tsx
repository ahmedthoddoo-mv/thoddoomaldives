import { EmailButton, EmailFooter, EmailLayout, EmailSection } from "@/lib/email/templates/shared";
import type { EmailContent } from "@/lib/email/types";

export function buildPartnerApprovedEmail(input: {
  businessName: string;
  dashboardUrl: string;
  setupUrl: string;
  supportEmail: string;
  siteUrl: string;
}): EmailContent {
  const subject = `Your partner account is approved`;
  const text = [
    `Congratulations — your partner account for ${input.businessName} has been approved.`,
    `Dashboard: ${input.dashboardUrl}`,
    `Setup: ${input.setupUrl}`,
    `Support: ${input.supportEmail}`,
  ].join("\n");

  const html = (
    <EmailLayout title="Partner account approved" preheader="Your dashboard is ready.">
      <EmailSection>
        <p>Congratulations — your partner account for <strong>{input.businessName}</strong> has been approved.</p>
        <p>You can now continue to your dashboard and finish setup.</p>
        <EmailButton href={input.dashboardUrl}>Open dashboard</EmailButton>
        <EmailButton href={input.setupUrl}>Complete account setup</EmailButton>
      </EmailSection>
      <EmailSection title="Next steps">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Review your profile details</li>
          <li>Confirm rooms, services, or transfers</li>
          <li>Contact support if anything needs adjustment</li>
        </ul>
      </EmailSection>
      <EmailFooter>
        Support: {input.supportEmail} · Site: {input.siteUrl.replace(/^https?:\/\//, "")}
      </EmailFooter>
    </EmailLayout>
  );

  return { subject, text, html };
}
