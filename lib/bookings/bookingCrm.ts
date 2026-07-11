import type { BookingTimelineEvent, BookingWorkflowRecord } from "@/types/booking-workflow";

export function createBookingTimelineEvents(booking: BookingWorkflowRecord): BookingTimelineEvent[] {
  const createdAt = booking.createdAt;
  const crmRecordId = booking.crmRecordId ?? "crm-thoddoo-sun-sky";
  const followUpDate = booking.arrival || createdAt.slice(0, 10);

  return [
    {
      id: `${booking.id}-note`,
      bookingId: booking.id,
      crmRecordId,
      type: "booking_note",
      title: "Booking note created",
      body: `${booking.guest.name} requested ${booking.roomType} at ${booking.propertyName}.`,
      createdAt
    },
    {
      id: `${booking.id}-timeline`,
      bookingId: booking.id,
      crmRecordId,
      type: "timeline_event",
      title: "Booking request submitted",
      body: `Estimated value $${booking.estimatedValue}, commission $${booking.commission.companyRevenue}.`,
      createdAt
    },
    {
      id: `${booking.id}-follow-up`,
      bookingId: booking.id,
      crmRecordId,
      type: "follow_up",
      title: "Follow up with guest and partner",
      body: `Confirm availability and reply by ${booking.contactPreference}.`,
      dueDate: followUpDate,
      createdAt
    }
  ];
}
