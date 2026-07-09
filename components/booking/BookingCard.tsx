import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import type { Booking } from "@/types/booking";

export function BookingCard({ booking }: { booking: Booking }) {
  const whatsappMessage = encodeURIComponent(`Hi, I am checking booking ${booking.id} for ${booking.propertyName}.`);

  return (
    <article className="adminBookingCard">
      <div>
        <span>{booking.id}</span>
        <h3>{booking.guest.name}</h3>
        <p>{booking.propertyName}</p>
      </div>
      <BookingStatusBadge status={booking.status} />
      <dl>
        <div><dt>Arrival</dt><dd>{booking.arrival}</dd></div>
        <div><dt>Departure</dt><dd>{booking.departure}</dd></div>
        <div><dt>Guests</dt><dd>{booking.guest.adults} adults · {booking.guest.children} children</dd></div>
        <div><dt>Estimated value</dt><dd>${booking.estimatedValue}</dd></div>
        <div><dt>Commission</dt><dd>${booking.commission.companyRevenue}</dd></div>
      </dl>
      <a href={`https://wa.me/${booking.guest.whatsapp?.replace(/\D/g, "")}?text=${whatsappMessage}`} target="_blank" rel="noreferrer">
        WhatsApp
      </a>
    </article>
  );
}
