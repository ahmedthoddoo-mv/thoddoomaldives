import type { ReactNode } from "react";
import { TransferIcon } from "@/components/transfer/TransferIcon";

export function TransferCompanyHero({
  title,
  description,
  heroImage,
  routeLabel,
  durationLabel,
  priceLabel,
  scheduleLabel,
  featured,
  nextDepartureLabel,
  children,
  checkAvailabilityHref,
  whatsappHref,
}: {
  title: string;
  description: string;
  heroImage: string;
  routeLabel: string;
  durationLabel: string;
  priceLabel: string;
  scheduleLabel: string;
  featured: boolean;
  nextDepartureLabel: string;
  children: ReactNode;
  checkAvailabilityHref: string;
  whatsappHref: string;
}) {
  return (
    <section className="platformHero transferHero" style={{ backgroundImage: `url('${heroImage}')` }}>
      <div className="platformHeroInner transferHeroLayout">
        <div className="transferHeroCopy">
          <p className="eyebrow">Premium speedboat company</p>
          <div className="transferHeroBadges" aria-label="Listing status">
            <span className="transferHeroChip">
              <TransferIcon name="check" />
              <span>Published partner</span>
            </span>
            <span className="transferHeroChip">
              <TransferIcon name="calendar" />
              <span>Live Supabase data</span>
            </span>
            {featured ? (
              <span className="transferHeroChip">
                <TransferIcon name="sun" />
                <span>Featured listing</span>
              </span>
            ) : null}
          </div>

          <h1>{title}</h1>
          <p>{description}</p>

          <div className="transferHeroActions">
            <a className="platformButton" href={checkAvailabilityHref}>
              Check availability
            </a>
            <a className="platformButtonSecondary transferGhostButton" href={whatsappHref} target="_blank" rel="noopener noreferrer">
              Ask on WhatsApp
            </a>
          </div>

          <p className="transferHeroNote">
            Availability is requested on WhatsApp; online confirmation is not claimed.
          </p>

          <dl className="transferHeroStats" aria-label="Transfer summary">
            <div>
              <dt>Duration</dt>
              <dd>{durationLabel}</dd>
            </div>
            <div>
              <dt>Route</dt>
              <dd>{routeLabel}</dd>
            </div>
            <div>
              <dt>Schedule</dt>
              <dd>{scheduleLabel}</dd>
            </div>
            <div>
              <dt>Next live departure</dt>
              <dd>{nextDepartureLabel}</dd>
            </div>
            <div>
              <dt>Price</dt>
              <dd>{priceLabel}</dd>
            </div>
            <div>
              <dt>Request style</dt>
              <dd>WhatsApp coordination</dd>
            </div>
          </dl>
        </div>

        {children}
      </div>
    </section>
  );
}
