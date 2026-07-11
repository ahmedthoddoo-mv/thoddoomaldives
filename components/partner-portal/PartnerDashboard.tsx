"use client";

import { useMemo } from "react";
import { PartnerStatCard } from "@/components/partner-portal/PartnerStatCard";
import {
  partnerAnalyticsMetrics,
  partnerChartData,
  partnerProfile,
  partnerStats
} from "@/data/partnerPortal";
import { calculatePartnerMetrics } from "@/lib/platform/metrics";
import { getBookingsForPartner, getMembershipForPartner, getMediaForEntity, getRoomsForProperty } from "@/lib/platform/selectors";
import { calculateBookingAnalytics } from "@/lib/bookings/bookingAnalytics";
import { useBookingWorkflow } from "@/lib/bookings/bookingWorkflowStore";

export function PartnerDashboard() {
  const selectedPartnerId = "partner-thoddoo-sun-sky";
  const partnerMetrics = calculatePartnerMetrics(selectedPartnerId);
  const initialPartnerBookings = useMemo(() => getBookingsForPartner(selectedPartnerId), [selectedPartnerId]);
  const partnerBookings = useBookingWorkflow(initialPartnerBookings).filter((booking) => booking.partnerId === selectedPartnerId);
  const bookingAnalytics = calculateBookingAnalytics(partnerBookings);
  const partnerMedia = getMediaForEntity("partner", selectedPartnerId);
  const partnerMembership = getMembershipForPartner(selectedPartnerId);
  const propertyRooms = getRoomsForProperty("property-thoddoo-sun-sky");
  const liveStats = [
    { label: "Booking Requests", value: String(bookingAnalytics.bookingRequests), detail: "Live browser demo queue", tone: "teal" as const },
    { label: "Pending Requests", value: String(partnerBookings.filter((booking) => booking.status === "pending" || booking.status === "new").length), detail: "Awaiting partner/admin review", tone: "gold" as const },
    { label: "Cancelled", value: String(partnerBookings.filter((booking) => booking.status === "cancelled").length), detail: "Cancelled demo records", tone: "coral" as const },
    { label: "Revenue Demo", value: `$${bookingAnalytics.revenueDemo}`, detail: `Commission $${bookingAnalytics.commissionDemo}`, tone: "green" as const }
  ];

  return (
    <div className="partnerPortalStack">
      <section className="partnerPortalStatsGrid" aria-label="Partner dashboard statistics">
        {liveStats.map((stat) => (
          <PartnerStatCard key={stat.label} stat={stat} />
        ))}
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
            <strong>{partnerBookings.length || partnerMetrics.bookingCount}</strong>
            <small>${bookingAnalytics.commissionDemo || partnerMetrics.demoCommission} demo commission</small>
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
