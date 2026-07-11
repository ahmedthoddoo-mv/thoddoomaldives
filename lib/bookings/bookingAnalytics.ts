import type { BookingWorkflowRecord } from "@/types/booking-workflow";

export function calculateBookingAnalytics(bookings: BookingWorkflowRecord[]) {
  const bookingRequests = bookings.length;
  const converted = bookings.filter((booking) => booking.status === "confirmed" || booking.status === "completed").length;
  const totalNights = bookings.reduce((total, booking) => total + booking.nights, 0);
  const revenueDemo = bookings.reduce((total, booking) => total + booking.estimatedValue, 0);
  const commissionDemo = bookings.reduce((total, booking) => total + booking.commission.companyRevenue, 0);

  return {
    bookingRequests,
    conversionRate: bookingRequests > 0 ? `${Math.round((converted / bookingRequests) * 100)}%` : "0%",
    averageStay: bookingRequests > 0 ? `${(totalNights / bookingRequests).toFixed(1)} nights` : "0 nights",
    revenueDemo,
    commissionDemo
  };
}
