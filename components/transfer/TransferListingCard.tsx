import Link from "next/link";
import { getAvailabilityMessage, getNextDeparture, getTransferPricingUnitLabel } from "@/lib/transfer";
import type { Transfer } from "@/types/transfer";

export function TransferListingCard({ transfer }: { transfer: Transfer }) {
  const nextDeparture = getNextDeparture(transfer);
  const availabilityMessage = getAvailabilityMessage(transfer.availability);

  return (
    <article className="transferListingCard">
      <div className="transferListingImage" style={{ backgroundImage: `url('${transfer.image}')` }} aria-hidden="true" />
      <div className="transferListingBody">
        <div className="transferListingBadges">
          <span className="platformPill">Daily service</span>
          {transfer.verified ? <span className="platformPill">Verified operator</span> : null}
          <span className="platformPill">{transfer.type === "public-speedboat" ? "Public speedboat" : transfer.type}</span>
        </div>
        <h2>{transfer.operatorName}</h2>
        <p className="transferListingRoute">{transfer.route}</p>
        <p>{transfer.shortDescription}</p>
        <dl className="transferMiniGrid">
          <div>
            <dt>Next departure</dt>
            <dd>{nextDeparture ? `${nextDeparture.time} · ${nextDeparture.direction}${nextDeparture.nextDay ? " (next day)" : ""}` : transfer.schedule?.fallbackMessage || "Please confirm the latest schedule before booking."}</dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd>{transfer.duration}</dd>
          </div>
          <div>
            <dt>Public price</dt>
            <dd>{transfer.price}</dd>
          </div>
          <div>
            <dt>Pricing unit</dt>
            <dd>{getTransferPricingUnitLabel(transfer.pricingUnit)}</dd>
          </div>
        </dl>
        <p className="transferListingSummary">{transfer.fleet?.length ? `Fleet of ${transfer.totalFleet} speedboats including ${transfer.fleet.map((item) => `${item.vessels} ${item.model}`).join(" and ")}.` : transfer.scheduleNote}</p>
        <p className="transferListingAvailability">{availabilityMessage}</p>
        <div className="transferCardActions">
          <Link href={`/transfer/${transfer.slug}`} className="platformButton">View details</Link>
          <a href={`https://wa.me/9609142538?text=${encodeURIComponent(`Hi, I would like to ask about ${transfer.operatorName} for ${transfer.route}. Please confirm the latest schedule and availability.`)}`} className="platformButton transferSecondaryAction" target="_blank" rel="noopener noreferrer">Ask on WhatsApp</a>
        </div>
      </div>
    </article>
  );
}
