import { getLivePublishedTransferDetail, getLivePublishedTransfers } from "@/lib/repositories/liveReads";
import { createPageMetadata } from "@/lib/seo";
import { nextTransferDeparture } from "@/lib/transfers/schedule";
import type { Metadata } from "next";
import Link from "next/link";

function icon(name: "clock" | "route" | "calendar" | "shield" | "sparkle" | "boat" | "check") {
  const paths = {
    clock: "M12 7v5l3 3m6-3a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z",
    route: "M5 19a2 2 0 1 0 0-4a2 2 0 0 0 0 4Zm14-14a2 2 0 1 0 0-4a2 2 0 0 0 0 4ZM7 17c5 0 5-10 10-10",
    calendar: "M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z",
    shield: "M12 3l7 3v5c0 5-3.5 8-7 10c-3.5-2-7-5-7-10V6l7-3Z",
    sparkle: "m12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z",
    boat: "M3 15l9 4l9-4M5 12h14l-2-5H7l-2 5Zm3-5V5h8v2",
    check: "M5 12l4 4L19 6"
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="transferIcon">
      <path d={paths[name]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Thoddoo Airport Transfers",
  description:
    "Compare and arrange Thoddoo airport transfers by public speedboat, private speedboat, ferry, or seaplane with local schedule guidance.",
  path: "/transfer",
  image: "/images/hero-thoddoo.jpg",
});

export default async function TransferPage() {
  const transferRead = await getLivePublishedTransfers();
  const options = transferRead.data;
  const scheduleDetails = await Promise.all(options.map((option) => getLivePublishedTransferDetail(option.slug)));
  const schedulesById = new Map(scheduleDetails.flatMap((read) => read.data ? [[read.data.transfer.id, read.data.schedules] as const] : []));
  const optionSummaries = options.map((option) => {
    const schedules = schedulesById.get(option.id) ?? [];
    const nextDeparture = nextTransferDeparture(schedules);
    const firstSchedule = schedules[0];

    return {
      option,
      schedules,
      nextDeparture,
      firstSchedule,
      priceLabel: firstSchedule?.price ? `${firstSchedule.currency} ${firstSchedule.price} ${firstSchedule.unit}` : option.price
    };
  });

  const nextLiveDeparture = optionSummaries
    .filter((summary) => summary.nextDeparture)
    .sort((left, right) => {
      const leftKey = `${left.nextDeparture?.date ?? "9999-99-99"}T${left.nextDeparture?.time ?? "99:99"}`;
      const rightKey = `${right.nextDeparture?.date ?? "9999-99-99"}T${right.nextDeparture?.time ?? "99:99"}`;
      return leftKey.localeCompare(rightKey);
    })[0];

  const featuredOptions = optionSummaries.filter((summary) => summary.option.featured);
  const fleetTypes = Array.from(new Set(options.map((option) => option.type.replace(/-/g, " "))));
  const travelNotes = [
    "Share your flight number and arrival time before travel so we can match you to the correct departure.",
    "Friday schedules can differ from the rest of the week, especially for public services.",
    "Sea conditions and weather may affect timings, so same-day reconfirmation is recommended.",
    "Private transfers and seaplanes should be requested in advance for the best availability."
  ];
  const reasonsToBook = [
    "We compare all current Thoddoo transfer options in one place.",
    "Our team helps align boat timing with your flight arrival or departure.",
    "You receive local guidance on Friday changes, luggage, and pickup arrangements."
  ];

  return (
    <main className="platformPage transferExperiencePage">
      <section
        className="platformHero transferHero"
        style={{ backgroundImage: "url('/images/hero-thoddoo.jpg')" }}
      >
        <div className="platformHeroInner transferHeroLayout">
          <div className="transferHeroCopy">
            <p className="eyebrow">Airport Transfers</p>
            <h1>Arrive in Thoddoo with a smoother, better-planned journey.</h1>
            <p>
              Compare public speedboats, private charters, ferries, and scenic air transfers with live schedule guidance tailored for Thoddoo arrivals.
            </p>
            <div className="transferHeroActions">
              <a
                href="https://wa.me/9609142538?text=Hi%20I%20need%20help%20arranging%20my%20transfer%20to%20Thoddoo"
                target="_blank"
                rel="noopener noreferrer"
                className="platformButton"
              >
                Book Transfer via WhatsApp
              </a>
              <a className="platformButtonSecondary transferGhostButton" href="#transfer-options">
                View transfer options
              </a>
            </div>
            <dl className="transferHeroStats" aria-label="Transfer overview">
              <div>
                <dt>Options</dt>
                <dd>{options.length}</dd>
              </div>
              <div>
                <dt>Fleet</dt>
                <dd>{fleetTypes.length} styles</dd>
              </div>
              <div>
                <dt>Coverage</dt>
                <dd>{featuredOptions.length > 0 ? `${featuredOptions.length} featured routes` : "Weekly departures"}</dd>
              </div>
            </dl>
          </div>

          <aside className="transferLiveCard" aria-label="Next departure overview">
            <p className="transferLiveLabel">Live next departure</p>
            {nextLiveDeparture?.nextDeparture ? (
              <>
                <h2>{nextLiveDeparture.option.title}</h2>
                <p className="transferLiveMeta">
                  {icon("calendar")}
                  <span>{nextLiveDeparture.nextDeparture.date} at {nextLiveDeparture.nextDeparture.time}</span>
                </p>
                <p className="transferLiveMeta">
                  {icon("route")}
                  <span>{nextLiveDeparture.nextDeparture.schedule.direction}</span>
                </p>
                <p className="transferLiveMeta">
                  {icon("clock")}
                  <span>{nextLiveDeparture.option.duration}</span>
                </p>
                <p className="transferLivePrice">{nextLiveDeparture.priceLabel}</p>
                <Link href={`/transfer/${nextLiveDeparture.option.slug}`} className="transferInlineLink">
                  Review this departure
                </Link>
              </>
            ) : (
              <>
                <h2>Schedule confirmation required</h2>
                <p className="transferLiveDescription">
                  We can still arrange your journey. Message us with your flight details for the best currently available option.
                </p>
              </>
            )}
          </aside>
        </div>
      </section>

      <section className="platformSection" id="transfer-options">
        <div className="platformContainer">
          <div className="platformSectionHeader">
            <p className="eyebrow">Transfer options</p>
            <h2>Choose the journey style that fits your arrival.</h2>
            <p>Each option keeps the current transfer logic intact while presenting the schedule, route, and booking details more clearly.</p>
            {transferRead.error ? <p>{transferRead.error}</p> : null}
          </div>

          <div className="platformGrid platformGridTwo transferDepartureGrid">
            {optionSummaries.map(({ option, schedules, nextDeparture, firstSchedule, priceLabel }) => {
              return (
              <Link
                key={option.id}
                href={`/transfer/${option.slug}`}
                className="platformCard transferCardLink transferDepartureCard"
                aria-label={`View details for ${option.title}`}
              >
                <div
                  className="platformCardImage transferDepartureImage"
                  style={{ backgroundImage: `url('${option.image}')` }}
                >
                  <div className="transferDepartureImageOverlay">
                    <span className="transferTypeBadge">{option.type.replace(/-/g, " ")}</span>
                    {option.featured ? <span className="transferFeaturedBadge">Featured</span> : null}
                  </div>
                </div>
                <div className="platformCardBody">
                  <div className="transferDepartureHeader">
                    <h3>{option.title}</h3>
                    <p className="transferDeparturePrice">{priceLabel}</p>
                  </div>

                  <div className="transferMetaList" aria-label={`${option.title} summary`}>
                    <p><span>{icon("clock")}</span><strong>Duration</strong><em>{option.duration}</em></p>
                    <p><span>{icon("route")}</span><strong>Route</strong><em>{firstSchedule ? `${firstSchedule.departurePoint} → ${firstSchedule.arrivalPoint}` : `${option.departurePoint} → ${option.arrivalPoint}`}</em></p>
                    <p><span>{icon("calendar")}</span><strong>Next departure</strong><em>{nextDeparture ? `${nextDeparture.date} at ${nextDeparture.time}` : "Confirm schedule"}</em></p>
                  </div>

                  <p className="transferScheduleNote">
                    {schedules.length ? `${schedules.length} scheduled departure${schedules.length === 1 ? "" : "s"} currently loaded.` : option.scheduleNote}
                  </p>

                  <ul className="transferHighlightsList">
                    {option.highlights.slice(0, 3).map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>

                  <div className="transferDepartureFooter">
                    <span className="transferCardAction" aria-hidden="true">
                      View details
                    </span>
                    {nextDeparture?.schedule.fridaySpecific ? <span className="transferFridayTag">Friday schedule</span> : null}
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="platformSection platformSectionMuted">
        <div className="platformContainer">
          <div className="transferShowcasePanel">
            <div className="platformSectionHeader">
              <p className="eyebrow">Fleet showcase</p>
              <h2>From practical shared departures to private premium crossings.</h2>
              <p>The current branch already exposes the data needed for a richer transfer browsing experience. This section surfaces it without changing how transfers are read or scheduled.</p>
            </div>

            <div className="transferFleetGrid" role="list" aria-label="Available transfer styles">
              {fleetTypes.map((type) => (
                <article key={type} className="transferFleetCard" role="listitem">
                  <span>{icon("boat")}</span>
                  <h3>{type.replace(/\b\w/g, (char) => char.toUpperCase())}</h3>
                  <p>
                    {type.includes("private")
                      ? "Ideal when you want flexible departure timing and a more exclusive arrival experience."
                      : type.includes("seaplane")
                        ? "A scenic daylight transfer best suited for guests prioritising speed and views."
                        : type.includes("ferry")
                          ? "A budget-led inter-island crossing with a simpler pace and local character."
                          : "A dependable shared boat with the best balance of speed, cost, and frequency."}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="platformSection">
        <div className="platformContainer transferInfoGrid">
          <article className="platformNotice transferInfoPanel">
            <div className="platformSectionHeader">
              <p className="eyebrow">Travel information</p>
              <h2>Before you travel</h2>
            </div>
            <ul>
              {travelNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </article>

          <article className="platformCard transferWhyBookCard">
            <div className="platformCardBody">
              <p className="eyebrow">Why book through iThoddoo Maldives</p>
              <h2>Local guidance, better timing, fewer surprises.</h2>
              <ul className="transferReasonList">
                {reasonsToBook.map((reason) => (
                  <li key={reason}>
                    <span>{icon("check")}</span>
                    <p>{reason}</p>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section className="platformSection platformSectionMuted">
        <div className="platformContainer">
          <div className="platformSectionHeader">
            <p className="eyebrow">Frequently asked</p>
            <h2>Common transfer questions</h2>
          </div>
          <div className="transferFaqGrid">
            <article className="platformCard transferFaqCard">
              <div className="platformCardBody">
                <h3>Which transfer should I choose?</h3>
                <p>Shared speedboats suit most arrivals, while private speedboats help when flight times do not match the standard schedule.</p>
              </div>
            </article>
            <article className="platformCard transferFaqCard">
              <div className="platformCardBody">
                <h3>Are Friday departures different?</h3>
                <p>They can be. Friday-specific departures are preserved in the current schedule architecture and highlighted on detail pages.</p>
              </div>
            </article>
            <article className="platformCard transferFaqCard">
              <div className="platformCardBody">
                <h3>When should I send my booking request?</h3>
                <p>As early as possible, especially for private transfers, seaplanes, or late-arrival coordination.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="platformCta transferClosingCta">
        <div className="platformContainer">
          <p className="eyebrow">Booking concierge</p>
          <h2>Need help choosing the best arrival plan?</h2>
          <p>
            Send us your arrival date, flight number, luggage notes, and number of guests. We&apos;ll recommend the most suitable transfer option using the current live implementation.
          </p>

          <a
            href="https://wa.me/9609142538?text=Hi%20I%20need%20help%20arranging%20my%20transfer%20to%20Thoddoo"
            target="_blank"
            rel="noopener noreferrer"
            className="platformButton mt-8"
          >
            Book Transfer via WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}
