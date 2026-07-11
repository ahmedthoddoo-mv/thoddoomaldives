"use client";

import { useEffect, useState } from "react";
import {
  readApplicationCrmEvents,
  subscribeToPartnerApplications
} from "@/lib/applications/partnerApplicationRepository";

type ApplicationCrmEvent = {
  id: string;
  partnerBusiness: string;
  label: string;
  detail: string;
  date: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(
    new Date(value)
  );
}

export function AdminCrmApplicationTimeline() {
  const [events, setEvents] = useState<ApplicationCrmEvent[]>(() => readApplicationCrmEvents() as ApplicationCrmEvent[]);

  useEffect(() => subscribeToPartnerApplications(() => setEvents(readApplicationCrmEvents() as ApplicationCrmEvent[])), []);

  if (events.length === 0) {
    return null;
  }

  return (
    <section className="adminPanel">
      <div className="adminSectionHeader">
        <p className="eyebrow">Application CRM</p>
        <h2>Application timeline</h2>
      </div>
      <div className="applicationTimeline">
        {events.slice(0, 5).map((event) => (
          <article key={event.id}>
            <span />
            <div>
              <strong>{event.label}</strong>
              <p>
                {event.partnerBusiness}: {event.detail}
              </p>
              <small>{formatDate(event.date)}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
