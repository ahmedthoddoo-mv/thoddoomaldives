import type { BookingDraft, Commission } from "@/types/booking";

export function calculateNights(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) {
    return 0;
  }

  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  const diff = end.getTime() - start.getTime();

  if (Number.isNaN(diff) || diff <= 0) {
    return 0;
  }

  return Math.ceil(diff / 86400000);
}

export function calculateCommission(bookingTotal: number, rate = 0.1): Commission {
  const companyRevenue = Math.round(bookingTotal * rate);

  return {
    rate,
    bookingTotal,
    companyRevenue,
    partnerRevenue: bookingTotal - companyRevenue
  };
}

export function calculateBookingDraft(draft: BookingDraft) {
  const nights = calculateNights(draft.checkIn, draft.checkOut);
  const accommodation = nights * draft.roomRate;
  const optionalServices = draft.services.reduce((total, service) => total + service.price, 0);
  const subtotal = accommodation + optionalServices;
  const total = subtotal;
  const commission = calculateCommission(total);

  return {
    nights,
    accommodation,
    optionalServices,
    subtotal,
    total,
    commission
  };
}

export function buildBookingWhatsAppMessage(draft: BookingDraft) {
  const estimate = calculateBookingDraft(draft);
  const serviceLines = draft.services.length
    ? draft.services.map((service) => `- ${service.name}: $${service.price}`).join("\n")
    : "No optional services selected";

  return [
    `Booking inquiry for ${draft.propertyName}`,
    "",
    `Check-in: ${draft.checkIn || "Not selected"}`,
    `Check-out: ${draft.checkOut || "Not selected"}`,
    `Nights: ${estimate.nights}`,
    `Adults: ${draft.adults}`,
    `Children: ${draft.children}`,
    `Room type: ${draft.roomType}`,
    `Estimated accommodation: $${estimate.accommodation}`,
    "",
    "Optional services:",
    serviceLines,
    "",
    `Estimated total: $${estimate.total}`,
    `Special requests: ${draft.specialRequests || "None"}`,
    "",
    "I found this property on iThoddoo Maldives."
  ].join("\n");
}
