import { EmailButton, EmailFooter, EmailLayout, EmailSection } from "@/lib/email/templates/shared";
import type { EmailContent } from "@/lib/email/types";

export function buildBookingConfirmationEmail(input: {
  guestName: string;
  reference: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  dashboardUrl: string;
  siteUrl: string;
}): EmailContent {
  const subject = `Booking enquiry received for ${input.propertyName}`;
  const text = [
    `Thanks ${input.guestName}, we received your booking enquiry for ${input.propertyName}.`,
    `Reference: ${input.reference}`,
    `Dates: ${input.checkIn} to ${input.checkOut}`,
    `View details: ${input.dashboardUrl}`,
  ].join("\n");

  const html = (
    <EmailLayout title="Booking enquiry received" preheader="Your enquiry has been received.">
      <EmailSection>
        <p>Thanks <strong>{input.guestName}</strong>, we received your booking enquiry for <strong>{input.propertyName}</strong>.</p>
        <p><strong>Reference:</strong> {input.reference}</p>
        <p><strong>Dates:</strong> {input.checkIn} to {input.checkOut}</p>
        <p>This is an enquiry only. Availability and final price are confirmed by the property team.</p>
        <EmailButton href={input.dashboardUrl}>View enquiry details</EmailButton>
      </EmailSection>
      <EmailFooter>
        Site: {input.siteUrl.replace(/^https?:\/\//, "")}
      </EmailFooter>
    </EmailLayout>
  );

  return { subject, text, html };
}
