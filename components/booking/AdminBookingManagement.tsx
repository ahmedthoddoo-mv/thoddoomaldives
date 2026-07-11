"use client";

import { useMemo, useState } from "react";
import { BookingCard } from "@/components/booking/BookingCard";
import type { Booking, BookingStatus } from "@/types/booking";
import { calculateBookingAnalytics } from "@/lib/bookings/bookingAnalytics";
import { getBookingEmailPreviews, updateBookingStatus, useBookingWorkflow } from "@/lib/bookings/bookingWorkflowStore";

const bookingTabs: Array<{ label: string; status?: BookingStatus }> = [
  { label: "Draft", status: "draft" },
  { label: "New Bookings", status: "new" },
  { label: "Pending", status: "pending" },
  { label: "Confirmed", status: "confirmed" },
  { label: "Cancelled", status: "cancelled" },
  { label: "Completed", status: "completed" }
];

export function AdminBookingManagement({ bookings }: { bookings: Booking[] }) {
  const liveBookings = useBookingWorkflow(bookings);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [selectedBookingId, setSelectedBookingId] = useState<string>(liveBookings[0]?.id ?? "");
  const analytics = calculateBookingAnalytics(liveBookings);
  const emailPreviews = getBookingEmailPreviews();
  const filteredBookings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return liveBookings.filter((booking) => {
      const statusMatch = statusFilter === "all" || booking.status === statusFilter;
      const searchMatch =
        normalizedQuery.length === 0 ||
        [
          booking.id,
          booking.propertyName,
          booking.partnerId,
          booking.guest.name,
          booking.guest.email,
          booking.guest.whatsapp,
          booking.arrival,
          booking.departure,
          booking.roomType,
          booking.status
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return statusMatch && searchMatch;
    });
  }, [liveBookings, query, statusFilter]);
  const selectedBooking = liveBookings.find((booking) => booking.id === selectedBookingId) ?? filteredBookings[0];
  const selectedEmails = selectedBooking ? emailPreviews.filter((preview) => preview.bookingId === selectedBooking.id) : [];

  function handleStatus(id: string, status: BookingStatus) {
    updateBookingStatus(id, status);
    setSelectedBookingId(id);
  }

  return (
    <div className="adminBookingManagement">
      <section className="adminContentHero">
        <div>
          <span className="inline-flex rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">Booking engine</span>
          <h1>Booking Management</h1>
          <p>Review demo bookings, commission estimates, guest details, status, and WhatsApp follow-up from one admin queue.</p>
        </div>
      </section>

      <section className="adminPanel">
        <div className="adminStatusGrid">
          <article className="adminSystemCard">
            <span>Booking requests</span>
            <strong>{analytics.bookingRequests}</strong>
            <p>All demo booking records.</p>
          </article>
          <article className="adminSystemCard">
            <span>Conversion rate</span>
            <strong>{analytics.conversionRate}</strong>
            <p>Confirmed or completed requests.</p>
          </article>
          <article className="adminSystemCard">
            <span>Average stay</span>
            <strong>{analytics.averageStay}</strong>
            <p>Derived from check-in/out dates.</p>
          </article>
          <article className="adminSystemCard">
            <span>Commission demo</span>
            <strong>${analytics.commissionDemo}</strong>
            <p>No payment is collected.</p>
          </article>
        </div>
      </section>

      <section className="adminPanel">
        <div className="adminContentToolbar">
          <label className="adminSearchField" htmlFor="booking-search">
            <span>Search bookings</span>
            <input
              id="booking-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search guest, property, partner, booking id..."
              type="search"
              value={query}
            />
          </label>
          <div className="adminFilterGroup" aria-label="Booking status filters">
            <button className={statusFilter === "all" ? "adminFilterActive" : ""} onClick={() => setStatusFilter("all")} type="button">
              All
            </button>
            {bookingTabs.map((tab) => (
              <button
                className={tab.status === statusFilter ? "adminFilterActive" : ""}
                key={tab.label}
                onClick={() => setStatusFilter(tab.status ?? "all")}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="adminBookingTabs" aria-label="Booking queue summary">
          {bookingTabs.map((tab) => (
            <span key={tab.label}>
              {tab.label}: {liveBookings.filter((booking) => booking.status === tab.status).length}
            </span>
          ))}
        </div>
        <div className="adminBookingGrid">
          {filteredBookings.map((booking) => (
            <BookingCard
              booking={booking}
              key={booking.id}
              onApprove={() => handleStatus(booking.id, "confirmed")}
              onComplete={() => handleStatus(booking.id, "completed")}
              onReject={() => handleStatus(booking.id, "cancelled")}
              onSelect={() => setSelectedBookingId(booking.id)}
            />
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <section className="adminEmptyState">
            <strong>No bookings found</strong>
            <p>Clear search or status filters to return to the full demo booking queue.</p>
          </section>
        ) : null}
      </section>

      {selectedBooking ? (
        <section className="adminPanel adminBookingDetailPanel">
          <div className="adminSectionHeader">
            <p className="eyebrow">View details</p>
            <h2>{selectedBooking.id}</h2>
            <p>
              {selectedBooking.guest.name} | {selectedBooking.propertyName} | {selectedBooking.arrival} to {selectedBooking.departure}
            </p>
          </div>
          <div className="adminPropertyDetailGrid">
            <div><span>Partner</span><strong>{selectedBooking.partnerId ?? "Unlinked"}</strong></div>
            <div><span>Property</span><strong>{selectedBooking.propertyName}</strong></div>
            <div><span>Guest</span><strong>{selectedBooking.guest.name}</strong></div>
            <div><span>Date</span><strong>{selectedBooking.arrival}</strong></div>
            <div><span>Revenue</span><strong>${selectedBooking.estimatedValue}</strong></div>
            <div><span>Commission</span><strong>${selectedBooking.commission.companyRevenue}</strong></div>
          </div>
          {selectedEmails.length > 0 ? (
            <div className="bookingEmailPreviewPanel">
              <h3>Email previews</h3>
              {selectedEmails.map((preview) => (
                <details key={preview.id}>
                  <summary>{preview.subject}</summary>
                  <pre>{preview.body}</pre>
                </details>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
