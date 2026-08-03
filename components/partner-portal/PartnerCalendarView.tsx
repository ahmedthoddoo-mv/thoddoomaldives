import type { Booking } from "@/types/booking";

export function PartnerCalendarView({ bookings }: { bookings: Booking[] }) {
  const datedBookings = [...bookings].sort((a, b) => a.arrival.localeCompare(b.arrival));
  return (
    <section className="partnerPortalPanel">
      <div className="partnerPortalSectionHeader">
        <p className="eyebrow">Live bookings</p>
        <h2>Arrival and Departure Schedule</h2>
      </div>
      {datedBookings.length ? <div className="partnerPortalList">
        {datedBookings.map((booking) => (
          <div key={booking.id}>
            <strong>{booking.arrival} – {booking.departure}</strong>
            <span>{booking.guest.name} · {booking.roomType} · {booking.status}</span>
          </div>
        ))}
      </div> : <p>No bookings are scheduled.</p>}
    </section>
  );
}
