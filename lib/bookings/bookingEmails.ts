import type { BookingEmailPreview, BookingWorkflowRecord } from "@/types/booking-workflow";

export function createBookingEmailPreviews(booking: BookingWorkflowRecord): BookingEmailPreview[] {
  const stayLine = `${booking.arrival} to ${booking.departure}`;

  return [
    {
      id: `${booking.id}-guest-email`,
      bookingId: booking.id,
      type: "guest_confirmation",
      subject: `Booking request received for ${booking.propertyName}`,
      body: [
        `Hi ${booking.guest.name},`,
        "",
        `We received your booking request for ${booking.propertyName}.`,
        `Stay dates: ${stayLine}`,
        `Room: ${booking.roomType}`,
        `Guests: ${booking.guest.adults} adults, ${booking.guest.children} children`,
        `Estimated total: $${booking.estimatedValue}`,
        "",
        "This is a preview only. No email has been sent."
      ].join("\n")
    },
    {
      id: `${booking.id}-partner-email`,
      bookingId: booking.id,
      type: "partner_notification",
      subject: `New booking request: ${booking.propertyName}`,
      body: [
        `New request from ${booking.guest.name}.`,
        `Dates: ${stayLine}`,
        `Room: ${booking.roomType}`,
        `Estimated partner revenue: $${booking.commission.partnerRevenue}`,
        `Contact preference: ${booking.contactPreference}`,
        "",
        "This is a preview only. No email has been sent."
      ].join("\n")
    },
    {
      id: `${booking.id}-admin-email`,
      bookingId: booking.id,
      type: "admin_notification",
      subject: `Admin booking alert: ${booking.id}`,
      body: [
        `Booking ${booking.id} is pending review.`,
        `Property: ${booking.propertyName}`,
        `Guest: ${booking.guest.name}`,
        `Commission preview: $${booking.commission.companyRevenue}`,
        `CRM record: ${booking.crmRecordId ?? "demo-crm"}`,
        "",
        "This is a preview only. No email has been sent."
      ].join("\n")
    }
  ];
}
