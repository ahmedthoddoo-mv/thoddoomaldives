import { EmailFooter, EmailLayout, EmailSection } from "@/lib/email/templates/shared";
import type { EmailContent } from "@/lib/email/types";

export function buildAdminNotificationEmail(input: {
  title: string;
  summary: string;
  adminUrl: string;
  siteUrl: string;
}): EmailContent {
  const subject = input.title;
  const text = [input.title, "", input.summary, "", `Admin: ${input.adminUrl}`].join("\n");

  const html = (
    <EmailLayout title="Admin notification" preheader={input.summary}>
      <EmailSection>
        <p>{input.summary}</p>
        <p><a href={input.adminUrl}>Open admin review</a></p>
      </EmailSection>
      <EmailFooter>
        Site: {input.siteUrl.replace(/^https?:\/\//, "")}
      </EmailFooter>
    </EmailLayout>
  );

  return { subject, text, html };
}
