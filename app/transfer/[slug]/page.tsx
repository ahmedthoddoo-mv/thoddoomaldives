import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLivePublishedTransferDetail } from "@/lib/repositories/liveReads";
import { createPageMetadata } from "@/lib/seo";
import { nextTransferDeparture } from "@/lib/transfers/schedule";
import { generateTransferLink } from "@/lib/whatsapp";
import { TransferBookingEnquiry } from "@/components/transfer/TransferBookingEnquiry";
import { TransferCompanyHero } from "@/components/transfer/TransferCompanyHero";
import { TransferFleetSection } from "@/components/transfer/TransferFleetSection";
import { TransferMobileBookingBar } from "@/components/transfer/TransferMobileBookingBar";
import { TransferScheduleSection } from "@/components/transfer/TransferScheduleSection";
import { TransferServiceFacts } from "@/components/transfer/TransferServiceFacts";
import { TransferTrustSection } from "@/components/transfer/TransferTrustSection";
import { collectTransferExceptions, groupTransferDirections, groupTransferFleet } from "@/components/transfer/transfer-utils";

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
  const reverseRoute = `${transfer.arrivalPoint} → ${transfer.departurePoint}`;
  const nextDeparture = nextTransferDeparture(schedules);
  const whatsappHref = generateTransferLink({ transfer: transfer.title });
  const bookingHref = "#booking-enquiry";
  const primaryPrice = schedules[0]?.price ? `${schedules[0].currency} ${schedules[0].price} ${schedules[0].unit}` : transfer.price;
  const directionGroups = groupTransferDirections(transfer, schedules);
  const fleetGroups = groupTransferFleet(schedules, transfer.image);
  const exceptions = collectTransferExceptions(schedules);
  const luggage = findHighlight(transfer.highlights, /luggage|baggage|suitcase|hand carry|\bkg\b/i)
    ?? "Confirm luggage allowance when you message the operator.";
  const pickupDropoff = findHighlight(transfer.highlights, /pick[ -]?up|drop[ -]?off|airport meet|hotel transfer/i)
    ?? schedules.find((item) => item.pickupDropoff)?.pickupDropoff
    ?? "Pickup and drop-off are confirmed with the operator after you send your request.";
  const safetyInformation = schedules.find((item) => item.weatherNotice)?.weatherNotice
    ?? schedules.find((item) => item.cancellationNotice)?.cancellationNotice
    ?? "Sea state and weather can affect departures. Please reconfirm before you travel.";
  const serviceNote = transfer.scheduleNote || "Current schedule details are shown below.";
  const whyBookPoints = [
    "Local booking coordination for route, luggage, and pickup details.",
    "Clear schedule guidance with Friday-specific timings preserved.",
    "WhatsApp assistance using the current live public record.",
    "Verified published partner surfaced from live Supabase data."
  ];
  const trustNote = "Missing fields are shown honestly or hidden. We do not invent vessel details, availability, or online confirmation.";
  const nextDepartureLabel = nextDeparture ? `${nextDeparture.date} at ${nextDeparture.time}` : "Schedule confirmation required";
  const nextDepartureNotice = nextDeparture?.notice;

  return (
    <main className="platformPage transferExperiencePage transferDetailPage">
      <TransferCompanyHero
        title={transfer.title}
        description={transfer.description}
        heroImage={transfer.image}
        routeLabel={route}
        durationLabel={transfer.duration}
        priceLabel={primaryPrice}
        scheduleLabel={serviceNote}
        featured={transfer.featured}
        nextDepartureLabel={nextDepartureLabel}
        checkAvailabilityHref={bookingHref}
        whatsappHref={whatsappHref}
      >
        <TransferBookingEnquiry
          companyName={transfer.title}
          defaultFrom={transfer.departurePoint}
          defaultTo={transfer.arrivalPoint}
          whatsappHref={whatsappHref}
        />
      </TransferCompanyHero>

      <dl className="srOnlyText" aria-label="Transfer detail summary">
        <div><dt>Duration:</dt><dd>{transfer.duration}</dd></div>
        <div><dt>Route:</dt><dd>{route}</dd></div>
        <div><dt>Departure point:</dt><dd>{transfer.departurePoint}</dd></div>
        <div><dt>Arrival point:</dt><dd>{transfer.arrivalPoint}</dd></div>
        <div><dt>Schedule:</dt><dd>{serviceNote}</dd></div>
        <div><dt>Luggage:</dt><dd>{luggage}</dd></div>
        <div><dt>Pickup/drop-off:</dt><dd>{pickupDropoff}</dd></div>
        <div><dt>Cancellation policy:</dt><dd>{safetyInformation}</dd></div>
      </dl>

      <TransferServiceFacts
        luggage={luggage}
        duration={transfer.duration}
        pickupDropoff={pickupDropoff}
        safetyInformation={safetyInformation}
      />

      <TransferFleetSection
        fleet={fleetGroups}
        fallbackMessage="Fleet details are not stored in the current public record for this partner, so please ask on WhatsApp for the latest vessel information."
      />

      <TransferScheduleSection
        title="Weekly timetable"
        directions={directionGroups}
        exceptions={exceptions}
        nextDepartureLabel={nextDepartureLabel}
        nextDepartureNotice={nextDepartureNotice}
        fridayNote="Live schedule in Maldives time. Friday-specific departures replace the regular timetable wherever the stored schedule marks them."
      />

      <TransferTrustSection points={whyBookPoints} note={trustNote} />

      <section className="platformCta transferClosingCta">
        <div className="platformContainer">
          <p className="eyebrow">Booking concierge</p>
          <h2>Request this transfer on WhatsApp</h2>
          <p>
            Send your travel date, passengers, and route details so the operator can confirm the live schedule, luggage guidance, and pickup point.
          </p>
          <div className="platformButtonRow">
            <a className="platformButton" href={whatsappHref} target="_blank" rel="noopener noreferrer">
              Request availability
            </a>
          </div>
        </div>
      </section>

      <TransferMobileBookingBar
        title={transfer.title}
        summary={nextDeparture ? `Next live departure ${nextDeparture.date} at ${nextDeparture.time}` : reverseRoute}
        whatsappHref={whatsappHref}
      />
    </main>
  );
}
