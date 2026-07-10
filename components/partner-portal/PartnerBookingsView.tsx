import { getBookingsForPartner } from "@/lib/platform/selectors";

const bookingTabs = ["Upcoming", "Pending", "Completed", "Cancelled"] as const;

export function PartnerBookingsView() {
  const bookings = getBookingsForPartner("partner-thoddoo-sun-sky");

  return (
    <div className="partnerPortalStack">
      {bookingTabs.map((tab) => (
        <section className="partnerPortalPanel" key={tab}>
          <div className="partnerPortalSectionHeader">
            <p className="eyebrow">{tab}</p>
            <h2>{tab === "Upcoming" ? "Upcoming Guests" : `${tab} Bookings`}</h2>
          </div>
          <div className="partnerPortalBookingList">
            {bookings
              .filter((booking) => {
                if (tab === "Upcoming") {
                  return booking.status === "new" || booking.status === "confirmed";
                }

                if (tab === "Pending") {
                  return booking.status === "pending";
                }

                if (tab === "Completed") {
                  return booking.status === "completed";
                }

                return booking.status === "cancelled";
              })
              .map((booking) => (
                <article key={booking.id}>
                  <div>
                    <strong>{booking.guest.name}</strong>
                    <p>{booking.guestRecord.partySize} guests | CRM {booking.crmRecordId}</p>
                    <small>
                      {booking.id} | {booking.roomType} | {booking.source} | Commission ${booking.commission.companyRevenue}
                    </small>
                  </div>
                  <span>${booking.estimatedValue}</span>
                  <small>{booking.arrival} to {booking.departure}</small>
                </article>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
