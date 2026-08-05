import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLivePublishedTransferDetail } from "@/lib/repositories/liveReads";
import { createPageMetadata } from "@/lib/seo";
import { nextTransferDeparture, weeklyTimetable } from "@/lib/transfers/schedule";
import { generateTransferLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

type TransferDetailPageProps = {
  params: Promise<{ slug: string }>;
};

async function readTransfer(slug: string) {
  const result = await getLivePublishedTransferDetail(slug);
  return result.data;
}

function findHighlight(highlights: string[], pattern: RegExp) {
  return highlights.find((highlight) => pattern.test(highlight));
}

function icon(name: "clock" | "route" | "calendar" | "luggage" | "shield" | "boat" | "check" | "sun") {
  const paths = {
    clock: "M12 7v5l3 3m6-3a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z",
    route: "M5 19a2 2 0 1 0 0-4a2 2 0 0 0 0 4Zm14-14a2 2 0 1 0 0-4a2 2 0 0 0 0 4ZM7 17c5 0 5-10 10-10",
    calendar: "M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z",
    luggage: "M8 8V6a4 4 0 1 1 8 0v2m-9 0h10a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a1 1 0 0 1 1-1Z",
    shield: "M12 3l7 3v5c0 5-3.5 8-7 10c-3.5-2-7-5-7-10V6l7-3Z",
    boat: "M3 15l9 4l9-4M5 12h14l-2-5H7l-2 5Zm3-5V5h8v2",
    check: "M5 12l4 4L19 6",
    sun: "M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364-1.414-1.414M7.05 7.05 5.636 5.636m12.728 0L16.95 7.05M7.05 16.95l-1.414 1.414M12 8a4 4 0 1 1 0 8a4 4 0 0 1 0-8Z"
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="transferIcon">
      <path d={paths[name]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export async function generateMetadata({ params }: TransferDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await readTransfer(slug);
  if (!detail) {
    return { title: "Transfer Not Found", robots: { index: false, follow: false } };
  }

  return {
    ...createPageMetadata({
      title: detail.transfer.title,
      description: detail.transfer.description,
      path: `/transfer/${detail.transfer.slug}`,
      image: detail.transfer.image
    }),
    robots: { index: true, follow: true }
  };
}

export default async function TransferDetailPage({ params }: TransferDetailPageProps) {
  const { slug } = await params;
  const detail = await readTransfer(slug);
  if (!detail) notFound();
  const { transfer, schedules } = detail;

  const route = `${transfer.departurePoint} → ${transfer.arrivalPoint}`;
  const luggage = findHighlight(transfer.highlights, /luggage|baggage|suitcase|hand carry|\bkg\b/i)
    ?? "Confirm luggage allowance when booking.";
  const pickupDropoff = findHighlight(transfer.highlights, /pick[ -]?up|drop[ -]?off|airport meet|hotel transfer/i)
    ?? "Confirm pickup and drop-off arrangements when booking.";
  const cancellationPolicy = findHighlight(transfer.highlights, /cancel|refund|no-show|reschedul/i)
    ?? "Confirm cancellation and refund terms before payment.";
  const nextDeparture = nextTransferDeparture(schedules);
  const directions = [...new Set(schedules.map((schedule) => schedule.direction))];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const primaryPrice = schedules[0]?.price ? `${schedules[0].currency} ${schedules[0].price} ${schedules[0].unit}` : transfer.price;
  const fleet = Array.from(new Map(
    schedules
      .filter((schedule) => schedule.vesselDetails || schedule.vesselCapacity)
      .map((schedule) => [`${schedule.vesselDetails ?? "details-on-request"}-${schedule.vesselCapacity ?? "na"}`, {
        details: schedule.vesselDetails ?? "Details on request",
        capacity: schedule.vesselCapacity,
        direction: schedule.direction
      }])
  ).values());
  const bookingFacts = [
    { label: "Luggage", value: schedules.find((item) => item.luggagePolicy)?.luggagePolicy ?? luggage, iconName: "luggage" as const },
    { label: "Pickup & drop-off", value: schedules.find((item) => item.pickupDropoff)?.pickupDropoff ?? pickupDropoff, iconName: "route" as const },
    { label: "Cancellation", value: schedules.find((item) => item.cancellationNotice)?.cancellationNotice ?? cancellationPolicy, iconName: "shield" as const },
    { label: "Weather", value: schedules.find((item) => item.weatherNotice)?.weatherNotice ?? "Schedules are weather dependent. Confirm before departure.", iconName: "sun" as const }
  ];
  const travelSteps = [
    `Send your flight details and preferred transfer request for ${transfer.title}.`,
    "Receive the recommended departure, route, and booking confirmation guidance.",
    "Reconfirm timing before travel, especially if weather or Friday schedules apply.",
    `Meet at ${transfer.departurePoint} and continue to ${transfer.arrivalPoint}.`
  ];
  const whyBook = [
    "Direct local support for flight-to-boat coordination.",
    "Current schedule architecture with Friday-specific handling preserved.",
    "WhatsApp-first booking flow for quick confirmation and guest communication."
  ];

  return (
    <main className="platformPage transferExperiencePage transferDetailPage">
      <section className="platformHero transferHero" style={{ backgroundImage: `url('${transfer.image}')` }}>
        <div className="platformHeroInner transferHeroLayout">
          <div className="transferHeroCopy">
            <p className="eyebrow">Thoddoo transfer</p>
            <h1>{transfer.title}</h1>
            <p>{transfer.description}</p>
            <div className="transferHeroActions">
              <a className="platformButton" href={generateTransferLink({ transfer: transfer.title })} target="_blank" rel="noopener noreferrer">
                Ask on WhatsApp
              </a>
              <Link className="platformButtonSecondary transferGhostButton" href="/transfer">Back to transfers</Link>
            </div>
            <dl className="transferHeroStats" aria-label="Transfer summary">
              <div>
                <dt>Duration</dt>
                <dd>{transfer.duration}</dd>
              </div>
              <div>
                <dt>Route</dt>
                <dd>{route}</dd>
              </div>
              <div>
                <dt>Price</dt>
                <dd>{primaryPrice}</dd>
              </div>
            </dl>
          </div>

          <aside className="transferLiveCard transferDetailLiveCard" aria-label="Next departure details">
            <p className="transferLiveLabel">Live next departure</p>
            {nextDeparture ? (
              <>
                <h2>{nextDeparture.date} at {nextDeparture.time}</h2>
                <p className="transferLiveMeta">
                  {icon("route")}
                  <span>{nextDeparture.schedule.direction}</span>
                </p>
                <p className="transferLiveMeta">
                  {icon("boat")}
                  <span>{nextDeparture.schedule.departurePoint} to {nextDeparture.schedule.arrivalPoint}</span>
                </p>
                {nextDeparture.notice ? <p className="transferScheduleAlert">{nextDeparture.notice}</p> : null}
              </>
            ) : (
              <>
                <h2>Schedule confirmation required</h2>
                <p className="transferLiveDescription">No future departure is currently surfaced. Use WhatsApp to confirm the next available crossing.</p>
              </>
            )}
            <div className="transferLiveDivider" />
            <p className="transferLivePrice">{primaryPrice}</p>
            <p className="transferLiveDescription">Current branch booking logic and SEO remain intact while the presentation is improved.</p>
          </aside>
        </div>
      </section>

      <section className="platformSection transferStickyOffset">
        <div className="platformContainer transferInfoGrid">
          <article className="platformCard transferOverviewCard">
            <div className="platformCardBody">
              <p className="eyebrow">Journey overview</p>
              <h2>Everything essential, at a glance.</h2>
              <dl className="srOnlyText">
                <div><dt>Duration:</dt><dd>{transfer.duration}</dd></div>
                <div><dt>Route:</dt><dd>{route}</dd></div>
                <div><dt>Departure point:</dt><dd>{transfer.departurePoint}</dd></div>
                <div><dt>Arrival point:</dt><dd>{transfer.arrivalPoint}</dd></div>
                <div><dt>Schedule:</dt><dd>{transfer.scheduleNote}</dd></div>
                <div><dt>Luggage:</dt><dd>{schedules.find((item) => item.luggagePolicy)?.luggagePolicy ?? luggage}</dd></div>
                <div><dt>Pickup/drop-off:</dt><dd>{schedules.find((item) => item.pickupDropoff)?.pickupDropoff ?? pickupDropoff}</dd></div>
                <div><dt>Cancellation policy:</dt><dd>{schedules.find((item) => item.cancellationNotice)?.cancellationNotice ?? cancellationPolicy}</dd></div>
              </dl>
              <div className="transferMetaList" aria-label="Transfer detail summary">
                <p><span>{icon("clock")}</span><strong>Duration</strong><em>{transfer.duration}</em></p>
                <p><span>{icon("route")}</span><strong>Route</strong><em>{route}</em></p>
                <p><span>{icon("calendar")}</span><strong>Schedule</strong><em>{transfer.scheduleNote}</em></p>
              </div>
            </div>
          </article>

          <article className="platformCard transferBookingPanel">
            <div className="platformCardBody">
              <p className="eyebrow">Booking information</p>
              <h2>Policies and travel guidance</h2>
              <div className="transferFactGrid">
                {bookingFacts.map((fact) => (
                  <article key={fact.label} className="transferFactCard">
                    <span>{icon(fact.iconName)}</span>
                    <strong>{fact.label}</strong>
                    <p>{fact.value}</p>
                  </article>
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>

      {schedules.length > 0 ? (
        <section className="platformSection platformSectionMuted" id="weekly-timetable">
          <div className="platformContainer">
            <div className="platformSectionHeader"><p className="eyebrow">Maldives time</p><h2>Weekly timetable</h2><p>Times may change for weather or operational reasons. Friday-specific schedules remain highlighted without changing the underlying schedule logic.</p></div>
            <nav className="platformPillRow" aria-label="Transfer directions">
              {directions.map((direction) => <a className="platformPill" href={`#${direction.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} key={direction}>{direction}</a>)}
            </nav>
            {directions.map((direction) => (
              <section id={direction.toLowerCase().replace(/[^a-z0-9]+/g, "-")} key={direction} className="platformCard transferScheduleSection transferTimetableCard">
                <div className="platformCardBody">
                  <div className="transferDirectionHeader">
                    <h3>{direction}</h3>
                    <p>{schedules.filter((schedule) => schedule.direction === direction).length} departures in current data</p>
                  </div>
                  <div className="transferTimetable">
                    {weeklyTimetable(schedules.filter((schedule) => schedule.direction === direction)).map(({ day, departures }) => (
                      <div key={day} className={day === 5 ? "transferTimetableRow transferTimetableFriday" : "transferTimetableRow"}>
                        <strong>
                          {dayNames[day]}
                          {day === 5 ? <span className="transferFridayTag">Friday</span> : null}
                        </strong>
                        <span>{departures.length ? departures.map((item) => item.departureTime.slice(0, 5)).join(", ") : "No scheduled departure"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </section>
      ) : null}

      <section className="platformSection">
        <div className="platformContainer transferDetailGrid">
          <article className="platformCard transferTimelineCard">
            <div className="platformCardBody">
              <p className="eyebrow">Journey timeline</p>
              <h2>From arrival planning to island landing.</h2>
              <ol className="transferJourneyTimeline">
                {travelSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </article>

          <article className="platformCard transferFleetPanel">
            <div className="platformCardBody">
              <p className="eyebrow">Fleet showcase</p>
              <h2>Vessel and service snapshot</h2>
              {fleet.length > 0 ? (
                <div className="transferFleetGrid" role="list" aria-label="Transfer fleet details">
                  {fleet.map((item) => (
                    <article key={`${item.details}-${item.capacity ?? "na"}`} className="transferFleetCard" role="listitem">
                      <span>{icon("boat")}</span>
                      <h3>{item.details}</h3>
                      <p>{item.capacity ? `Capacity ${item.capacity}` : "Capacity on request"}</p>
                      <small>{item.direction}</small>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="transferFallbackText">Vessel details are confirmed as part of booking for this route.</p>
              )}
            </div>
          </article>
        </div>
      </section>

      <section className="platformSection platformSectionMuted">
        <div className="platformContainer transferInfoGrid">
          <article className="platformCard transferWhyBookCard">
            <div className="platformCardBody">
              <p className="eyebrow">Why book through iThoddoo Maldives</p>
              <h2>Local support around a live schedule system.</h2>
              <ul className="transferReasonList">
                {whyBook.map((reason) => (
                  <li key={reason}>
                    <span>{icon("check")}</span>
                    <p>{reason}</p>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="platformNotice transferInfoPanel">
            <div className="platformSectionHeader">
              <p className="eyebrow">Travel information</p>
              <h2>Useful notes for this journey</h2>
            </div>
            <ul>
              <li>Departure times are shown in Maldives time.</li>
              <li>Flight delays, sea state, and Friday routing can affect same-day travel.</li>
              <li>Send luggage details in advance if you are travelling with oversized bags or equipment.</li>
              <li>Use the planner after booking if you want to coordinate transfers with the rest of your stay.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="platformCta transferClosingCta"><div className="platformContainer"><p className="eyebrow">Booking concierge</p><h2>Plan this transfer</h2><p>Ask the operator to confirm your departure, luggage, pickup, and final fare using the existing WhatsApp booking flow.</p><div className="platformButtonRow"><a className="platformButton" href={generateTransferLink({ transfer: transfer.title })} target="_blank" rel="noopener noreferrer">Enquire on WhatsApp</a><Link className="platformButtonSecondary" href={`/planner?transfer=${encodeURIComponent(transfer.slug)}`}>Add to trip</Link></div></div></section>

      <section className="platformSection platformSectionMuted">
        <div className="platformContainer">
          <div className="platformSectionHeader">
            <p className="eyebrow">Included information</p>
            <h2>Highlights and FAQ</h2>
          </div>
          <div className="transferFaqGrid">
            <article className="platformNotice">
              <ul>{transfer.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
            </article>
            <article className="platformCard transferFaqCard">
              <div className="platformCardBody">
                <h3>How do I reserve this transfer?</h3>
                <p>Use WhatsApp to send your flight number, arrival time, and guest count. The existing booking logic will handle the message formatting.</p>
                <h3>Can this route change due to weather?</h3>
                <p>Yes. Weather notices are preserved from the current implementation, and operational changes should always be reconfirmed before departure.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <div className="transferStickyBar" role="region" aria-label="Sticky transfer booking actions">
        <div>
          <strong>{transfer.title}</strong>
          <span>{nextDeparture ? `${nextDeparture.date} at ${nextDeparture.time}` : primaryPrice}</span>
        </div>
        <a className="platformButton" href={generateTransferLink({ transfer: transfer.title })} target="_blank" rel="noopener noreferrer">
          Book via WhatsApp
        </a>
      </div>
    </main>
  );
}
