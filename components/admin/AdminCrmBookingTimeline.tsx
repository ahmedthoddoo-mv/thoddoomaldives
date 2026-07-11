"use client";

import { useBookingTimeline } from "@/lib/bookings/bookingWorkflowStore";

export function AdminCrmBookingTimeline() {
  const events = useBookingTimeline();

  return (
    <section className="adminPanel">
      <div className="adminSectionHeader">
        <p className="eyebrow">Booking timeline</p>
        <h2>Automatic CRM Activity</h2>
        <p>Booking requests create a note, timeline event, and follow-up reminder in browser demo storage.</p>
      </div>

      {events.length > 0 ? (
        <div className="adminCrmNotesTimeline" aria-label="Booking CRM timeline">
          {events.map((event) => (
            <article key={event.id}>
              <div>
                <strong>{event.title}</strong>
                <span>{event.createdAt.slice(0, 10)}</span>
              </div>
              <p>{event.body}</p>
              <small>
                Booking {event.bookingId} | CRM {event.crmRecordId}
                {event.dueDate ? ` | Follow-up ${event.dueDate}` : ""}
              </small>
            </article>
          ))}
        </div>
      ) : (
        <section className="adminEmptyState">
          <strong>No booking activity yet</strong>
          <p>Submit a booking request from a property page to populate this CRM timeline.</p>
        </section>
      )}
    </section>
  );
}
