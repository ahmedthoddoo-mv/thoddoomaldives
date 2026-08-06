import { calculateBookingAnalytics } from "@/lib/bookings/bookingAnalytics";
import type { Booking } from "@/types/booking";

export function PartnerAnalyticsView({ bookings }: { bookings: Booking[] }) {
  const summary = calculateBookingAnalytics(bookings);
  const metrics = [
    ["Booking requests", String(summary.bookingRequests)],
    ["Conversion rate", summary.conversionRate],
    ["Quoted value", `$${summary.quotedValue.toFixed(2)}`],
    ["Confirmed revenue", `$${summary.confirmedRevenue.toFixed(2)}`]
  ];

  return (
    <div className="partnerPortalStack">
      <section className="partnerPortalStatsGrid">
        {metrics.map(([label, value]) => (
          <article className="partnerPortalCard partnerPortalStat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>
      {bookings.length === 0 ? <section className="partnerPortalPanel"><p>No booking analytics are available yet.</p></section> : null}
    </div>
  );
}
