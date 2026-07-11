import type { PartnerApplicationTimelineEvent } from "@/types/partner-application";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function ApplicationTimeline({ timeline }: { timeline: PartnerApplicationTimelineEvent[] }) {
  return (
    <div className="applicationTimeline">
      {timeline.map((event) => (
        <article key={event.id}>
          <span />
          <div>
            <strong>{event.label}</strong>
            <p>{event.detail}</p>
            <small>
              {formatDate(event.date)} · {event.actor}
            </small>
          </div>
        </article>
      ))}
    </div>
  );
}
