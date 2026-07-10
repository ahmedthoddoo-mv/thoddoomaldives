import { partnerBookings } from "@/data/partnerPortal";

const bookingTabs = ["Upcoming", "Pending", "Completed", "Cancelled"] as const;

export function PartnerBookingsView() {
  return (
    <div className="partnerPortalStack">
      {bookingTabs.map((tab) => (
        <section className="partnerPortalPanel" key={tab}>
          <div className="partnerPortalSectionHeader">
            <p className="eyebrow">{tab}</p>
            <h2>{tab === "Upcoming" ? "Upcoming Guests" : `${tab} Bookings`}</h2>
          </div>
          <div className="partnerPortalBookingList">
            {partnerBookings
              .filter((booking) => booking.status === tab)
              .map((booking) => (
                <article key={booking.id}>
                  <div>
                    <strong>{booking.guest}</strong>
                    <p>{booking.summary}</p>
                    <small>
                      {booking.id} | {booking.room} | {booking.source}
                    </small>
                  </div>
                  <span>{booking.value}</span>
                  <small>{booking.dates}</small>
                </article>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
