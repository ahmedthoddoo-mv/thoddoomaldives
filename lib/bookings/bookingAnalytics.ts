import type { Booking } from "@/types/booking";

export function calculateBookingAnalytics(bookings: Booking[]) {
  const bookingRequests = bookings.length;
  const converted = bookings.filter((booking) => booking.status === "confirmed" || booking.status === "completed").length;
  const pricedBookings = bookings.filter((booking) =>
    booking.estimatedValue !== null && !["cancelled", "rejected", "draft"].includes(booking.status)
  );
  const totalNights = bookings.reduce((total, booking) => total + booking.nights, 0);
  const quotedValue = pricedBookings.reduce((total, booking) => total + (booking.estimatedValue ?? 0), 0);
  const confirmedRevenue = pricedBookings
    .filter((booking) => booking.status === "confirmed" || booking.status === "completed")
    .reduce((total, booking) => total + (booking.estimatedValue ?? 0), 0);
  const commissionRevenue = pricedBookings
    .filter((booking) => booking.status === "confirmed" || booking.status === "completed")
    .reduce((total, booking) => total + (booking.commission.companyRevenue ?? 0), 0);

  return {
    bookingRequests,
    conversionRate: bookingRequests > 0 ? `${Math.round((converted / bookingRequests) * 100)}%` : "0%",
    averageStay: bookingRequests > 0 ? `${(totalNights / bookingRequests).toFixed(1)} nights` : "0 nights",
    quotedValue,
    confirmedRevenue,
    commissionRevenue
  };
}
