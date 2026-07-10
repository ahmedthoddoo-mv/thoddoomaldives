import { PartnerStatCard } from "@/components/partner-portal/PartnerStatCard";
import {
  partnerAnalyticsMetrics,
  partnerChartData,
  partnerProfile,
  partnerStats
} from "@/data/partnerPortal";
import { calculatePartnerMetrics } from "@/lib/platform/metrics";
import { getBookingsForPartner, getMembershipForPartner, getMediaForEntity, getRoomsForProperty } from "@/lib/platform/selectors";

export function PartnerDashboard() {
  const selectedPartnerId = "partner-thoddoo-sun-sky";
  const partnerMetrics = calculatePartnerMetrics(selectedPartnerId);
  const partnerBookings = getBookingsForPartner(selectedPartnerId);
  const partnerMedia = getMediaForEntity("partner", selectedPartnerId);
  const partnerMembership = getMembershipForPartner(selectedPartnerId);
  const propertyRooms = getRoomsForProperty("property-thoddoo-sun-sky");

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
                  <strong>{booking.guest.name}</strong>
                  <p>{booking.propertyName} | CRM: {booking.crmRecordId}</p>
                </div>
                <span>{booking.status}</span>
                <small>{booking.arrival} to {booking.departure}</small>
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
          <p className="eyebrow">Integrated relationship</p>
          <h2>Property, Booking, Media, Membership</h2>
        </div>
        <div className="partnerPortalSnapshotGrid">
          <div>
            <span>Property</span>
            <strong>Thoddoo Sun Sky Inn</strong>
            <small>{propertyRooms.length} rooms connected</small>
          </div>
          <div>
            <span>Bookings</span>
            <strong>{partnerMetrics.bookingCount}</strong>
            <small>${partnerMetrics.demoCommission} demo commission</small>
          </div>
          <div>
            <span>Gallery</span>
            <strong>{partnerMedia.length}</strong>
            <small>Media Library assets</small>
          </div>
          <div>
            <span>Membership</span>
            <strong>{partnerMembership?.name ?? partnerProfile.membershipPlan}</strong>
            <small>{partnerProfile.renewalStatus}</small>
          </div>
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
