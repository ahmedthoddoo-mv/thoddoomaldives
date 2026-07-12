"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { updateRealBookingStatus } from "@/app/booking/actions";
import { getBookingsForPartner } from "@/lib/platform/selectors";
import { updateBookingStatus, useBookingWorkflow } from "@/lib/bookings/bookingWorkflowStore";
import type { Booking } from "@/types/booking";

const bookingTabs = ["Upcoming", "Pending", "Completed", "Cancelled"] as const;

type PartnerBookingsViewProps = {
  selectedPartnerId?: string;
  initialBookings?: Booking[];
};

export function PartnerBookingsView({ selectedPartnerId = "partner-thoddoo-sun-sky", initialBookings: repositoryBookings }: PartnerBookingsViewProps) {
  const router = useRouter();
  const [notesByBooking, setNotesByBooking] = useState<Record<string, string>>({});
  const [actionMessage, setActionMessage] = useState("");
  const initialBookings = useMemo(
    () => (repositoryBookings && repositoryBookings.length > 0 ? repositoryBookings : getBookingsForPartner(selectedPartnerId)),
    [repositoryBookings, selectedPartnerId]
  );
  const bookings = useBookingWorkflow(initialBookings).filter((booking) => booking.partnerId === selectedPartnerId);

  async function handlePartnerUpdate({
    bookingId,
    status,
    roomPrepared,
    internalNotes
  }: {
    bookingId: string;
    status?: "confirmed";
    roomPrepared?: boolean;
    internalNotes?: string;
  }) {
    if (status) {
      updateBookingStatus(bookingId, status);
    }

    const result = await updateRealBookingStatus({
      bookingId,
      actor: "partner",
      partnerId: selectedPartnerId,
      status,
      roomPrepared,
      internalNotes
    });

    setActionMessage(result.message);

    if (result.ok && result.mode === "supabase") {
      router.refresh();
    }
  }

  return (
    <div className="partnerPortalStack">
      {actionMessage ? (
        <section className="partnerPortalPanel">
          <p>{actionMessage}</p>
        </section>
      ) : null}
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
                      {booking.reference ?? booking.id} | {booking.roomType} | {booking.source} | Commission ${booking.commission.companyRevenue}
                    </small>
                    <div className="partnerBookingActions">
                      <button type="button" onClick={() => handlePartnerUpdate({ bookingId: booking.id, status: "confirmed" })}>
                        Confirm booking
                      </button>
                      <button type="button" onClick={() => handlePartnerUpdate({ bookingId: booking.id, roomPrepared: true })}>
                        Mark room prepared
                      </button>
                    </div>
                    <label className="partnerBookingNoteField">
                      <span>Internal notes</span>
                      <textarea
                        onChange={(event) => setNotesByBooking((current) => ({ ...current, [booking.id]: event.target.value }))}
                        placeholder="Arrival notes, room setup, payment notes..."
                        value={notesByBooking[booking.id] ?? booking.internalNotes ?? ""}
                      />
                    </label>
                    <button
                      className="partnerBookingNoteButton"
                      type="button"
                      onClick={() => handlePartnerUpdate({ bookingId: booking.id, internalNotes: notesByBooking[booking.id] ?? booking.internalNotes ?? "" })}
                    >
                      Save notes
                    </button>
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
