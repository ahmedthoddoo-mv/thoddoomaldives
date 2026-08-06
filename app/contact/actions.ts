"use server";

import { sendEmail } from "@/lib/email/client";
import { platformConfig } from "@/lib/config/platform";
import { buildAdminNotificationEmail } from "@/lib/email/templates/admin-notification";
import { buildContactConfirmationEmail } from "@/lib/email/templates/contact-confirmation";
import type { PlannedTrip } from "@/types/planner";

export type ContactEnquiryInput = {
  name: string;
  email: string;
  whatsapp: string;
  request: string;
  plannedTrip: PlannedTrip;
};

export type ContactEnquiryResult = {
  ok: boolean;
  message: string;
  errors?: string[];
};

function clean(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

function formatTripSummary(plannedTrip: PlannedTrip, request: string) {
  return [
    `Arrival: ${plannedTrip.arrivalDate || "Not specified"}`,
    `Departure: ${plannedTrip.departureDate || "Not specified"}`,
    `Adults: ${plannedTrip.adults || "Not specified"}`,
    `Children: ${plannedTrip.children || "Not specified"}`,
    `Budget: ${plannedTrip.budgetRange || "Not specified"}`,
    `Accommodation: ${plannedTrip.accommodationType || "Not specified"}`,
    `Interests: ${plannedTrip.interests.length > 0 ? plannedTrip.interests.join(", ") : "Not specified"}`,
    `Additional Request: ${request || "Not specified"}`
  ].join("\n");
}

export async function submitContactEnquiry(input: ContactEnquiryInput): Promise<ContactEnquiryResult> {
  const name = clean(input.name, 120);
  const email = clean(input.email, 160).toLowerCase();
  const whatsapp = clean(input.whatsapp, 40);
  const request = clean(input.request, 2000);
  const plannedTrip: PlannedTrip = {
    arrivalDate: clean(input.plannedTrip.arrivalDate, 20),
    departureDate: clean(input.plannedTrip.departureDate, 20),
    adults: clean(input.plannedTrip.adults, 10),
    children: clean(input.plannedTrip.children, 10),
    budgetRange: clean(input.plannedTrip.budgetRange, 80),
    accommodationType: clean(input.plannedTrip.accommodationType, 120),
    interests: input.plannedTrip.interests.map((interest) => clean(interest, 80)).filter(Boolean)
  };

  const errors: string[] = [];
  const emailValid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const whatsappDigits = whatsapp.replace(/\D/g, "");
  if (!email && whatsappDigits.length < 7) {
    errors.push("Provide a valid email or WhatsApp number.");
  }
  if (!emailValid) {
    errors.push("Enter a valid email address.");
  }
  if (!request) {
    errors.push("Add your travel request before sending.");
  }
  if (errors.length > 0) {
    return { ok: false, message: "Please correct the enquiry details.", errors };
  }

  const summary = formatTripSummary(plannedTrip, request);
  const siteUrl = platformConfig.companyContact.website.replace(/\/$/, "");
  const adminEmail = buildAdminNotificationEmail({
    title: `New contact enquiry${name ? `: ${name}` : ""}`,
    summary: `${name || "Guest"} sent a contact enquiry.\n\nEmail: ${email || "Not provided"}\nWhatsApp: ${whatsapp || "Not provided"}\n\n${summary}`,
    adminUrl: `${siteUrl}/admin/crm`,
    siteUrl
  });

  const jobs = [
    sendEmail({
      to: platformConfig.companyContact.email,
      ...adminEmail
    })
  ];

  if (email) {
    jobs.push(
      sendEmail({
        to: { address: email, name: name || undefined },
        ...buildContactConfirmationEmail({
          name,
          siteUrl,
          supportEmail: platformConfig.companyContact.email,
          summary
        })
      })
    );
  }

  const emailResults = await Promise.allSettled(jobs);
  const emailWarnings = emailResults.flatMap((result) => {
    if (result.status === "rejected") return ["Email delivery failed."];
    if (result.value.skipped) return [result.value.reason];
    return [];
  });

  return {
    ok: true,
    message: `Enquiry sent successfully.${emailWarnings.length > 0 ? ` ${emailWarnings.join(" ")}` : ""}`
  };
}
