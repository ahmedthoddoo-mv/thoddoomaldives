import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";
import { getLivePublishedTransfers } from "@/lib/repositories/liveReads";
import { createPageMetadata } from "@/lib/seo";
import { generateTransferEnquiryLink } from "@/lib/whatsapp";

export const metadata: Metadata = createPageMetadata({
  title: "Thoddoo Airport Transfers – Nasru Speed Boat | USD 35 per person",
  description:
    "Book the Nasru Speed Boat public speedboat transfer between Velana International Airport and Thoddoo Island. USD 35 per person, approx 70–80 min, daily departures.",
  path: "/transfer",
  image: "/images/hero-thoddoo.jpg",
});

const WHATSAPP_ENQUIRY = generateTransferEnquiryLink({});

const timetable = [
  {
    route: "Thoddoo → Airport",
    departures: [
      { time: "06:45", days: "Daily" },
      { time: "13:00", days: "Sat – Thu" },
      { time: "14:00", days: "Fri (replaces 13:00)" },
    ],
  },
  {
    route: "Airport → Thoddoo",
    departures: [
      { time: "10:15", days: "Daily" },
      { time: "16:00", days: "Daily" },
    ],
  },
];

const fleet = [
  {
    model: "Gulf Craft 38",
    capacity: "32 passengers",
    count: 4,
    icon: "🚤",
  },
  {
    model: "Gulf Craft 48",
    capacity: "60 passengers",
    count: 3,
    icon: "⛵",
  },
];

const journeySteps = [
  {
    step: "1",
    title: "Enquire via WhatsApp",
    detail: "Send your travel date, flight number, direction, and number of passengers.",
  },
  {
    step: "2",
    title: "Availability Confirmed",
    detail: "Our team checks with the operator and confirms your seat. Availability confirmed after enquiry.",
  },
  {
    step: "3",
    title: "Receive Booking Details",
    detail: "Get pickup point, departure time, and payment instructions directly.",
  },
  {
    step: "4",
    title: "Board at the Harbour",
    detail: "Arrive at Male / Airport harbour 20 minutes before departure. Crew will assist with boarding.",
  },
  {
    step: "5",
    title: "Arrive in Thoddoo",
    detail: "Approximately 70–80 minutes later, you land at Thoddoo harbour. Weather may affect travel time.",
  },
];

const serviceCards = [
  {
    icon: "🧳",
    title: "Luggage",
    items: [
      "One standard suitcase per passenger",
      "One carry-on bag per passenger",
      "Oversized or extra items: discuss with operator",
      "Keep valuables in a waterproof bag",
    ],
  },
  {
    icon: "🌊",
    title: "Sea Conditions",
    items: [
      "Travel time is approx 70–80 minutes",
      "Weather and sea conditions may affect schedule",
      "Operator may reschedule in rough seas",
      "Check forecast on your travel day",
    ],
  },
  {
    icon: "📍",
    title: "Departure Points",
    items: [
      "Male / Velana Airport jetty area",
      "Arrive 20 minutes before departure",
      "Exact pickup confirmed at booking",
      "Thoddoo harbour drop-off",
    ],
  },
  {
    icon: "💳",
    title: "Payment",
    items: [
      "USD 35 per person, one way",
      "Payment to operator directly",
      "Cash or transfer — confirmed at booking",
      "Children rates: enquire with operator",
    ],
  },
];

const faqs = [
  {
    q: "How long does the speedboat take from Airport to Thoddoo?",
    a: "Approximately 70–80 minutes under normal conditions. Weather and sea state can extend this.",
  },
  {
    q: "Can I book a seat online?",
    a: "The speedboat operator manages seats through their own system. Enquire via WhatsApp and we will confirm availability with them on your behalf.",
  },
  {
    q: "Is there a departure on Friday at 13:00?",
    a: "No. On Fridays the Thoddoo → Airport departure is at 14:00 instead of 13:00. All other days operate at 13:00.",
  },
  {
    q: "What if my flight is delayed?",
    a: "Contact us as early as possible. We will advise on the next available departure from the airport.",
  },
  {
    q: "How many boats operate?",
    a: "Nasru Speed Boat operates 4 Gulf Craft 38 boats (32 passengers) and 3 Gulf Craft 48 boats (60 passengers).",
  },
  {
    q: "What luggage can I bring?",
    a: "One suitcase and one carry-on per person. Oversized or extra items should be discussed with the operator before travel.",
  },
];

const whyBook = [
  {
    icon: "🏝️",
    title: "Local Knowledge",
    body: "We live and work in Thoddoo. We know the schedules, the harbour, and the operator personally.",
  },
  {
    icon: "📲",
    title: "Direct WhatsApp Booking",
    body: "No platform fees. Enquire directly and get a personal confirmation from our team.",
  },
  {
    icon: "🛟",
    title: "On-Island Support",
    body: "If anything changes before or after your transfer, we are reachable on the island.",
  },
];

export default async function TransferPage() {
  const transferRead = await getLivePublishedTransfers();
  const options = transferRead.data;

  return (
    <main className="platformPage">
      {/* ── Hero ── */}
      <section
        className="platformHero transferHero"
        style={{ backgroundImage: "url('/images/hero-thoddoo.jpg')" }}
      >
        <div className="platformHeroInner">
          <p className="eyebrow">Nasru Speed Boat · Public Speedboat</p>
          <h1>Thoddoo Airport&nbsp;Transfer</h1>
          <p>
            Daily public speedboat between Velana International Airport and
            Thoddoo Island. Approx 70–80 min · USD 35 per person.
          </p>
          <div className="platformButtonRow">
            <a
              href={WHATSAPP_ENQUIRY}
              target="_blank"
              rel="noopener noreferrer"
              className="platformButton"
              aria-label="Enquire about transfer via WhatsApp"
            >
              <span aria-hidden="true">💬</span>&nbsp; Enquire via WhatsApp
            </a>
            <a href="#timetable" className="platformButtonSecondary">
              View Timetable
            </a>
          </div>
        </div>
      </section>

      {/* ── Enquiry widget ── */}
      <section className="transferEnquiryBand" aria-label="Quick enquiry">
        <div className="platformContainer transferEnquiryRow">
          <div className="transferEnquiryStat">
            <span className="transferEnquiryStatValue">USD&nbsp;35</span>
            <span className="transferEnquiryStatLabel">per person · one way</span>
          </div>
          <div className="transferEnquiryStat">
            <span className="transferEnquiryStatValue">~70–80 min</span>
            <span className="transferEnquiryStatLabel">journey time</span>
          </div>
          <div className="transferEnquiryStat">
            <span className="transferEnquiryStatValue">Daily</span>
            <span className="transferEnquiryStatLabel">departures both ways</span>
          </div>
          <div className="transferEnquiryCta">
            <p className="transferEnquiryNote">
              Availability confirmed after enquiry
            </p>
            <a
              href={WHATSAPP_ENQUIRY}
              target="_blank"
              rel="noopener noreferrer"
              className="platformButton"
            >
              Check Availability
            </a>
          </div>
        </div>
      </section>

      {/* ── Live transfer options (Supabase) ── */}
      {options.length > 0 && (
        <section className="platformSection">
          <div className="platformContainer">
            <div className="platformSectionHeader">
              <p className="eyebrow">Transfer options</p>
              <h2>Available Transfers</h2>
              {transferRead.error ? (
                <p className="transferError">{transferRead.error}</p>
              ) : null}
            </div>
            <div className="platformGrid platformGridTwo">
              {options.map((option) => (
                <article key={option.id} className="platformCard">
                  <div
                    className="platformCardImage"
                    style={{ backgroundImage: `url('${option.image}')` }}
                    role="img"
                    aria-label={option.title}
                  />
                  <div className="platformCardBody">
                    <div className="platformPillRow">
                      <span className="platformPill">{option.type}</span>
                    </div>
                    <h3>{option.title}</h3>
                    <p>
                      <strong>Duration:</strong> {option.duration}
                    </p>
                    <p className="transferPrice">{option.price}</p>
                    <ul className="transferHighlightList">
                      {option.highlights.map((detail) => (
                        <li key={detail}>
                          <span aria-hidden="true">✓</span> {detail}
                        </li>
                      ))}
                    </ul>
                    <div className="platformButtonRow">
                      <Link
                        href={`/transfer/${option.slug}`}
                        className="platformButton"
                      >
                        View Details
                      </Link>
                      <a
                        href={generateTransferEnquiryLink({})}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="platformButtonSecondary transferCardWa"
                      >
                        💬 WhatsApp
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Fleet ── */}
      <section className="platformSection platformSectionMuted" aria-labelledby="fleet-heading">
        <div className="platformContainer">
          <div className="platformSectionHeader">
            <p className="eyebrow">The Fleet</p>
            <h2 id="fleet-heading">Nasru Speed Boat Fleet</h2>
            <p>
              Modern Gulf Craft vessels maintained for comfort and safety on the
              open sea between Malé and Thoddoo.
            </p>
          </div>
          <div className="platformGrid platformGridTwo">
            {fleet.map((vessel) => (
              <div key={vessel.model} className="platformCard transferFleetCard">
                <div className="transferFleetIcon" aria-hidden="true">
                  {vessel.icon}
                </div>
                <div className="platformCardBody">
                  <h3>{vessel.model}</h3>
                  <p className="transferFleetCount">
                    {vessel.count} boat{vessel.count !== 1 ? "s" : ""} in operation
                  </p>
                  <p className="transferFleetCapacity">{vessel.capacity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timetable ── */}
      <section
        className="platformSection"
        id="timetable"
        aria-labelledby="timetable-heading"
      >
        <div className="platformContainer">
          <div className="platformSectionHeader">
            <p className="eyebrow">Schedule</p>
            <h2 id="timetable-heading">Weekly Timetable</h2>
            <p>
              All times are local Maldives time (UTC+5). Schedules are subject
              to change due to weather and sea conditions.
            </p>
          </div>
          <div className="platformGrid platformGridTwo">
            {timetable.map((route) => (
              <div key={route.route} className="platformCard transferTimetableCard">
                <div className="platformCardBody">
                  <h3 className="transferRouteTitle">{route.route}</h3>
                  <table className="transferTimetable" aria-label={`${route.route} timetable`}>
                    <thead>
                      <tr>
                        <th scope="col">Departure</th>
                        <th scope="col">Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {route.departures.map((dep) => (
                        <tr
                          key={dep.time + dep.days}
                          className={dep.days.includes("Fri (") ? "transferFridayRow" : ""}
                        >
                          <td className="transferTimeCell">{dep.time}</td>
                          <td>{dep.days}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
          <div className="platformNotice platformNoticeWarning transferTimetableNote">
            <strong>Friday exception:</strong> The Thoddoo → Airport 13:00
            departure moves to <strong>14:00</strong> on Fridays.
          </div>
        </div>
      </section>

      {/* ── Guest journey timeline ── */}
      <section
        className="platformSection platformSectionMuted"
        aria-labelledby="journey-heading"
      >
        <div className="platformContainer">
          <div className="platformSectionHeader">
            <p className="eyebrow">Your journey</p>
            <h2 id="journey-heading">From Enquiry to Thoddoo Harbour</h2>
          </div>
          <ol className="transferTimeline" role="list">
            {journeySteps.map((s) => (
              <li key={s.step} className="transferTimelineStep">
                <div className="transferTimelineNumber" aria-hidden="true">
                  {s.step}
                </div>
                <div className="transferTimelineContent">
                  <h3>{s.title}</h3>
                  <p>{s.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Luggage & service cards ── */}
      <section className="platformSection" aria-labelledby="service-heading">
        <div className="platformContainer">
          <div className="platformSectionHeader">
            <p className="eyebrow">What to expect</p>
            <h2 id="service-heading">Luggage &amp; Service Information</h2>
          </div>
          <div className="platformGrid transferServiceGrid">
            {serviceCards.map((card) => (
              <div key={card.title} className="platformCard transferServiceCard">
                <div className="transferServiceIcon" aria-hidden="true">
                  {card.icon}
                </div>
                <div className="platformCardBody">
                  <h3>{card.title}</h3>
                  <ul className="transferServiceList">
                    {card.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Important travel information ── */}
      <section
        className="platformSection platformSectionMuted"
        aria-labelledby="travelinfo-heading"
      >
        <div className="platformContainer">
          <div className="platformSectionHeader">
            <p className="eyebrow">Before you travel</p>
            <h2 id="travelinfo-heading">Important Travel Information</h2>
          </div>
          <div className="platformNotice">
            <ul>
              <li>
                <strong>Book in advance</strong> — seats fill quickly, especially
                in peak season.
              </li>
              <li>
                <strong>Send your flight details</strong> — we need your flight
                number and arrival time to match you to the right departure.
              </li>
              <li>
                <strong>Arrive early</strong> — be at the harbour at least 20
                minutes before departure.
              </li>
              <li>
                <strong>Weather delays</strong> — rough seas or strong winds may
                delay or reschedule services. Check conditions on your travel day.
              </li>
              <li>
                <strong>Maldives entry</strong> — confirm visa and health
                documentation requirements with official sources before travel.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="platformSection" aria-labelledby="faq-heading">
        <div className="platformContainer">
          <div className="platformSectionHeader">
            <p className="eyebrow">FAQ</p>
            <h2 id="faq-heading">Frequently Asked Questions</h2>
          </div>
          <dl className="transferFaqList">
            {faqs.map((faq) => (
              <div key={faq.q} className="transferFaqItem">
                <dt className="transferFaqQ">{faq.q}</dt>
                <dd className="transferFaqA">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Why book through iThoddoo ── */}
      <section
        className="platformSection platformSectionMuted"
        aria-labelledby="why-heading"
      >
        <div className="platformContainer">
          <div className="platformSectionHeader">
            <p className="eyebrow">Why us</p>
            <h2 id="why-heading">Why Book Through iThoddoo Maldives</h2>
          </div>
          <div className="platformGrid platformGridThree">
            {whyBook.map((item) => (
              <div key={item.title} className="platformCard transferWhyCard">
                <div className="transferWhyIcon" aria-hidden="true">
                  {item.icon}
                </div>
                <div className="platformCardBody">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="platformCta">
        <div className="platformContainer">
          <h2>Ready to Book Your Transfer?</h2>
          <p>
            Send us your travel date, flight number, direction and number of
            passengers. We will confirm availability and get you on board.
          </p>
          <div className="platformButtonRow" style={{ justifyContent: "center" }}>
            <a
              href={WHATSAPP_ENQUIRY}
              target="_blank"
              rel="noopener noreferrer"
              className="platformButton"
              aria-label="Book transfer via WhatsApp"
            >
              💬 Book via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── Mobile sticky booking bar ── */}
      <div className="transferStickyBar" role="complementary" aria-label="Quick book">
        <div className="transferStickyContent">
          <span className="transferStickyPrice">USD 35 / person</span>
          <a
            href={WHATSAPP_ENQUIRY}
            target="_blank"
            rel="noopener noreferrer"
            className="platformButton transferStickyBtn"
            aria-label="Enquire now via WhatsApp"
          >
            Enquire Now
          </a>
        </div>
      </div>
    </main>
  );
}
