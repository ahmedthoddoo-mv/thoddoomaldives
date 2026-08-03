"use client";

import { PartnerStatCard } from "@/components/partner-portal/PartnerStatCard";
import { calculateBookingAnalytics } from "@/lib/bookings/bookingAnalytics";
import type { AdminManagedProperty } from "@/data/adminContent";
import type { Booking } from "@/types/booking";

type PartnerDashboardProps = {
  initialPartnerBookings?: Booking[];
  initialPropertyRooms?: AdminManagedProperty["roomTypes"];
  membershipName?: string;
  propertyName?: string;
  selectedPartnerId?: string;
};

export function PartnerDashboard({
  initialPartnerBookings: repositoryBookings,
  initialPropertyRooms,
  membershipName,
  propertyName = "Business",
  selectedPartnerId = ""
}: PartnerDashboardProps) {
  const partnerBookings = (repositoryBookings ?? []).filter((booking) => booking.partnerId === selectedPartnerId);
  const bookingAnalytics = calculateBookingAnalytics(partnerBookings);
  const propertyRooms = initialPropertyRooms ?? [];
  const liveStats = [
    { label: "Booking Requests", value: String(bookingAnalytics.bookingRequests), detail: "Live enquiries", tone: "teal" as const },
    { label: "Pending Requests", value: String(partnerBookings.filter((booking) => booking.status === "pending" || booking.status === "new").length), detail: "Awaiting partner/admin review", tone: "gold" as const },
    { label: "Cancelled", value: String(partnerBookings.filter((booking) => booking.status === "cancelled").length), detail: "Cancelled enquiries", tone: "coral" as const },
    { label: "Confirmed Revenue", value: `$${bookingAnalytics.confirmedRevenue}`, detail: "Priced confirmed and completed bookings", tone: "green" as const }
  ];

  return (
    <div className="partnerPortalStack">
      <section className="partnerPortalStatsGrid" aria-label="Partner dashboard statistics">
        {liveStats.map((stat) => (
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

        <section className="partnerPortalPanel"><div className="partnerPortalSectionHeader"><p className="eyebrow">Performance</p><h2>Booking Summary</h2></div><p>{partnerBookings.length === 0 ? "No bookings yet" : `${bookingAnalytics.conversionRate} conversion rate · ${bookingAnalytics.averageStay} average stay`}</p></section>
      </div>

      <section className="partnerPortalPanel">
        <div className="partnerPortalSectionHeader">
          <p className="eyebrow">Integrated relationship</p>
          <h2>Property, Booking, Media, Membership</h2>
        </div>
        <div className="partnerPortalSnapshotGrid">
          <div>
            <span>Property</span>
            <strong>{propertyName}</strong>
            <small>{propertyRooms.length} rooms connected</small>
          </div>
          <div>
            <span>Bookings</span>
            <strong>{partnerBookings.length}</strong>
            <small>{bookingAnalytics.quotedValue > 0 ? `$${bookingAnalytics.quotedValue} quoted value` : "No priced enquiries"}</small>
          </div>
          <div>
            <span>Membership</span>
            <strong>{membershipName ?? "Free"}</strong>
            <small>Current database plan</small>
          </div>
        </div>
      </section>
    </div>
  );
}
