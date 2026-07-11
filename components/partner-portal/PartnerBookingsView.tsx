"use client";

import { useMemo } from "react";
import { getBookingsForPartner } from "@/lib/platform/selectors";
import { useBookingWorkflow } from "@/lib/bookings/bookingWorkflowStore";

const bookingTabs = ["Upcoming", "Pending", "Completed", "Cancelled"] as const;

export function PartnerBookingsView() {
  const selectedPartnerId = "partner-thoddoo-sun-sky";
  const initialBookings = useMemo(() => getBookingsForPartner(selectedPartnerId), [selectedPartnerId]);
  const bookings = useBookingWorkflow(initialBookings).filter((booking) => booking.partnerId === selectedPartnerId);

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
                    <p>{booking.guest.adults + booking.guest.children} guests | CRM {booking.crmRecordId}</p>
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
