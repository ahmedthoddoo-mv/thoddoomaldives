import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import type { Booking } from "@/types/booking";

type BookingCardProps = {
  booking: Booking;
  onApprove?: () => void;
  onReject?: () => void;
  onComplete?: () => void;
  onSelect?: () => void;
};

export function BookingCard({ booking, onApprove, onReject, onComplete, onSelect }: BookingCardProps) {
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
        <div><dt>Guests</dt><dd>{booking.guest.adults} adults | {booking.guest.children} children</dd></div>
        <div><dt>Estimated value</dt><dd>${booking.estimatedValue}</dd></div>
        <div><dt>Commission</dt><dd>${booking.commission.companyRevenue}</dd></div>
        <div><dt>CRM</dt><dd>{booking.crmRecordId ?? "unlinked"}</dd></div>
        <div><dt>Partner</dt><dd>{booking.partnerId ?? "unlinked"}</dd></div>
        <div><dt>Guest record</dt><dd>{booking.guestRecordId ?? "demo guest"}</dd></div>
      </dl>
      <a href={`https://wa.me/${booking.guest.whatsapp?.replace(/\D/g, "")}?text=${whatsappMessage}`} target="_blank" rel="noreferrer">
        WhatsApp
      </a>
      <div className="adminBookingActions">
        <button onClick={onSelect} type="button">View Details</button>
        <button onClick={onApprove} type="button">Approve</button>
        <button onClick={onReject} type="button">Reject</button>
        <button onClick={onComplete} type="button">Complete</button>
      </div>
    </article>
  );
}
