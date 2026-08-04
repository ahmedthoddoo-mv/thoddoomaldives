import { getAvailabilityMessage, getNextDeparture, getScheduleDirectionTimes, getTransferPricingUnitLabel } from "@/lib/transfer";
import type { Transfer } from "@/types/transfer";

export function TransferScheduleSection({ transfer }: { transfer: Transfer }) {
  const nextDeparture = getNextDeparture(transfer);

  return (
    <section className="platformSection">
      <div className="platformContainer">
        <div className="platformSectionHeader">
          <p className="eyebrow">Daily timetable</p>
          <h2>Daily departures in Maldives local time</h2>
          <p>{transfer.schedule?.fallbackMessage || "Please confirm the latest schedule before booking."}</p>
        </div>
        <div className="transferScheduleGrid">
          {transfer.schedule?.directions.map((direction) => (
            <article key={direction.label} className="transferInfoCard">
              <h3>{direction.label}</h3>
              <p>{direction.operatingDays || transfer.schedule?.timezone}</p>
              <div className="transferTimeRow">
                {getScheduleDirectionTimes(transfer.schedule, direction.label, "Fri").map((time) => (
                  <span key={`${direction.label}-${time}`}>{time}</span>
                ))}
              </div>
              {direction.note ? <p className="transferInfoNote">{direction.note}</p> : null}
            </article>
          ))}
          <article className="transferInfoCard">
            <h3>Next departure</h3>
            <p>{nextDeparture ? `${nextDeparture.time} · ${nextDeparture.direction}` : transfer.schedule?.fallbackMessage || "Please confirm the latest schedule before booking."}</p>
            <p className="transferInfoNote">{transfer.schedule?.timezone || "Maldives Time (UTC+5)"}</p>
          </article>
        </div>
      </div>
    </section>
  );
}

export function TransferFleetSection({ transfer }: { transfer: Transfer }) {
  if (!transfer.fleet?.length) return null;
  return (
    <section className="platformSection platformSectionMuted">
      <div className="platformContainer">
        <div className="platformSectionHeader">
          <p className="eyebrow">Fleet</p>
          <h2>Built for daily airport transfers</h2>
          <p>Total fleet: {transfer.totalFleet} speedboats.</p>
        </div>
        <div className="transferInfoGrid">
          {transfer.fleet.map((item) => (
            <article key={item.model} className="transferInfoCard">
              <h3>{item.model}</h3>
              <p>{item.vessels} vessels</p>
              <strong>{item.capacityPerVessel} passengers per vessel</strong>
              <p>{item.summary}</p>
            </article>
          ))}
          <article className="transferInfoCard">
            <h3>Service support</h3>
            <p>Professional crew</p>
            <p>{getAvailabilityMessage(transfer.availability)}</p>
          </article>
        </div>
      </div>
    </section>
  );
}

export function TransferInclusionsSection({ transfer }: { transfer: Transfer }) {
  return (
    <section className="platformSection">
      <div className="platformContainer">
        <div className="platformSectionHeader">
          <p className="eyebrow">Included information</p>
          <h2>What this transfer includes</h2>
        </div>
        <div className="transferInfoGrid">
          {transfer.inclusions.map((item) => (
            <article key={item} className="transferFeatureCard">
              <h3>{item}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TransferJourneySection() {
  const steps = [
    "Guest arrives at Velana International Airport",
    "Guest proceeds to or meets the representative near the airport jetty",
    "Check in before departure",
    "Board the speedboat",
    "Travel approximately 70–80 minutes",
    "Arrive at Thoddoo harbor",
    "Buggy or hotel transfer where included or arranged",
  ];

  return (
    <section className="platformSection platformSectionMuted">
      <div className="platformContainer">
        <div className="platformSectionHeader">
          <p className="eyebrow">Guest journey</p>
          <h2>What the transfer day looks like</h2>
          <p>Exact meeting instructions are shared after booking confirmation.</p>
        </div>
        <ol className="transferTimeline">
          {steps.map((step, index) => (
            <li key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function TransferImportantInfoSection({ transfer }: { transfer: Transfer }) {
  return (
    <section className="platformSection">
      <div className="platformContainer">
        <div className="platformSectionHeader">
          <p className="eyebrow">Important travel information</p>
          <h2>Confirm operational details before payment</h2>
        </div>
        <div className="transferInfoGrid">
          {transfer.importantInformation.map((item) => (
            <article key={item} className="transferInfoCard">
              <p>{item}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TransferFaqSection({ transfer }: { transfer: Transfer }) {
  return (
    <section className="platformSection platformSectionMuted">
      <div className="platformContainer">
        <div className="platformSectionHeader">
          <p className="eyebrow">FAQ</p>
          <h2>Common booking questions</h2>
        </div>
        <div className="transferFaqList">
          {(transfer.faqs || []).map((faq) => (
            <details key={faq.question} className="transferFaqItem">
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TransferTrustSection({ transfer }: { transfer: Transfer }) {
  return (
    <section className="platformSection">
      <div className="platformContainer">
        <div className="platformSectionHeader">
          <p className="eyebrow">Why book through iThoddoo Maldives?</p>
          <h2>Clear local assistance from enquiry to confirmation</h2>
        </div>
        <div className="transferInfoGrid">
          {[
            "Local Thoddoo support",
            "Verified partner workflow",
            "Clear booking assistance",
            "WhatsApp support",
            "Coordinated guesthouse and transfer enquiries",
            "Transparent public selling price",
          ].map((item) => (
            <article key={item} className="transferFeatureCard">
              <h3>{item}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TransferHeroAside({ transfer }: { transfer: Transfer }) {
  return (
    <aside className="transferHeroAside">
      <p className="eyebrow">Booking support</p>
      <strong>{transfer.price}</strong>
      <span>{getTransferPricingUnitLabel(transfer.pricingUnit)}</span>
      <p>{getAvailabilityMessage(transfer.availability)}</p>
      <a href="#transfer-enquiry" className="platformButton">Book transfer</a>
      <a href={`https://wa.me/9609142538?text=${encodeURIComponent(`Hi, I would like to ask about ${transfer.operatorName}. Please confirm the latest schedule and availability.`)}`} className="platformButton transferSecondaryAction" target="_blank" rel="noopener noreferrer">Ask on WhatsApp</a>
    </aside>
  );
}
