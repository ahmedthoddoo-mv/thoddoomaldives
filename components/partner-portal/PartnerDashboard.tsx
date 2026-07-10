import { PartnerStatCard } from "@/components/partner-portal/PartnerStatCard";
import {
  partnerAnalyticsMetrics,
  partnerBookings,
  partnerChartData,
  partnerProfile,
  partnerStats
} from "@/data/partnerPortal";

export function PartnerDashboard() {
  return (
    <div className="partnerPortalStack">
      <section className="partnerPortalStatsGrid" aria-label="Partner dashboard statistics">
        {partnerStats.map((stat) => (
          <PartnerStatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <div className="partnerPortalTwoColumn">
        <section className="partnerPortalPanel">
          <div className="partnerPortalSectionHeader">
            <p className="eyebrow">Today</p>
            <h2>Booking Pulse</h2>
          </div>
          <div className="partnerPortalBookingList">
            {partnerBookings.slice(0, 3).map((booking) => (
              <article key={booking.id}>
                <div>
                  <strong>{booking.guest}</strong>
                  <p>{booking.summary}</p>
                </div>
                <span>{booking.status}</span>
                <small>{booking.dates}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="partnerPortalPanel">
          <div className="partnerPortalSectionHeader">
            <p className="eyebrow">Performance</p>
            <h2>Weekly Demand</h2>
          </div>
          <div className="partnerPortalChart">
            {partnerChartData.map((point) => (
              <div key={point.label}>
                <span style={{ height: `${point.value}%` }} />
                <small>{point.label}</small>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="partnerPortalPanel">
        <div className="partnerPortalSectionHeader">
          <p className="eyebrow">Growth</p>
          <h2>Partner Snapshot</h2>
        </div>
        <div className="partnerPortalSnapshotGrid">
          {partnerAnalyticsMetrics.slice(0, 4).map((metric) => (
            <div key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.change}</small>
            </div>
          ))}
          <div>
            <span>Renewal Status</span>
            <strong>{partnerProfile.renewalStatus}</strong>
            <small>{partnerProfile.membershipPlan} plan</small>
          </div>
        </div>
      </section>
    </div>
  );
}
