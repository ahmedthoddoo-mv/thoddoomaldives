import { calculateBookingDraft } from "@/lib/booking";
import type { BookingDraft } from "@/types/booking";
import { CommissionCard } from "@/components/booking/CommissionCard";

export function BookingSummary({ draft }: { draft: BookingDraft }) {
  const estimate = calculateBookingDraft(draft);

  return (
    <aside className="bookingSummaryCard" aria-live="polite">
      <p className="eyebrow">Live booking summary</p>
      <h3>{draft.propertyName}</h3>
      <dl>
        <div>
          <dt>Nights</dt>
          <dd>{estimate.nights}</dd>
        </div>
        <div>
          <dt>Accommodation</dt>
          <dd>${estimate.accommodation}</dd>
        </div>
        <div>
          <dt>Optional services</dt>
          <dd>${estimate.optionalServices}</dd>
        </div>
        <div>
          <dt>Subtotal</dt>
          <dd>${estimate.subtotal}</dd>
        </div>
        <div className="bookingSummaryTotal">
          <dt>Estimated total</dt>
          <dd>${estimate.total}</dd>
        </div>
      </dl>
      <CommissionCard commission={estimate.commission} />
    </aside>
  );
}
