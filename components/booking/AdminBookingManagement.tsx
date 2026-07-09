import { BookingCard } from "@/components/booking/BookingCard";
import type { Booking, BookingStatus } from "@/types/booking";

const bookingTabs: Array<{ label: string; status?: BookingStatus }> = [
  { label: "New Bookings", status: "new" },
  { label: "Pending", status: "pending" },
  { label: "Confirmed", status: "confirmed" },
  { label: "Cancelled", status: "cancelled" },
  { label: "Completed", status: "completed" }
];

export function AdminBookingManagement({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="adminBookingManagement">
      <section className="adminContentHero">
        <div>
          <span className="inline-flex rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">Booking engine</span>
          <h1>Booking Management</h1>
          <p>Review demo bookings, commission estimates, guest details, status, and WhatsApp follow-up from one admin queue.</p>
        </div>
      </section>

      <section className="adminPanel">
        <div className="adminBookingTabs">
          {bookingTabs.map((tab) => (
            <span key={tab.label}>{tab.label}</span>
          ))}
        </div>
        <div className="adminBookingGrid">
          {bookings.map((booking) => (
            <BookingCard booking={booking} key={booking.id} />
          ))}
        </div>
      </section>
    </div>
  );
}
