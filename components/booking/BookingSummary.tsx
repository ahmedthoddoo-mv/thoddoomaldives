import { calculateBookingDraft } from "@/lib/booking";
import type { BookingDraft } from "@/types/booking";

export function BookingSummary({ draft }: { draft: BookingDraft }) {
  const estimate = calculateBookingDraft(draft);

  return (
    <aside className="bookingSummaryCard" aria-live="polite">
      <p className="eyebrow">Enquiry summary</p>
      <h3>{draft.propertyName}</h3>
      <dl>
        <div>
          <dt>Nights</dt>
          <dd>{estimate.nights}</dd>
        </div>
        <div>
          <dt>Price per night</dt>
          <dd>{draft.roomRate ? `$${draft.roomRate}` : "Price on request"}</dd>
        </div>
        <div>
          <dt>Accommodation</dt>
          <dd>{estimate.accommodation === null ? "To be confirmed" : `$${estimate.accommodation}`}</dd>
        </div>
        <div>
          <dt>Optional services</dt>
          <dd>{estimate.optionalServices === null ? "To be confirmed" : `$${estimate.optionalServices}`}</dd>
        </div>
        <div>
          <dt>Subtotal</dt>
          <dd>{estimate.subtotal === null ? "To be confirmed" : `$${estimate.subtotal}`}</dd>
        </div>
        <div>
          <dt>Taxes/fees</dt>
          <dd>To be confirmed</dd>
        </div>
        {estimate.total !== null ? <div className="bookingSummaryTotal">
          <dt>Estimated total</dt>
          <dd>${estimate.total}</dd>
        </div> : null}
      </dl>
      <p>Your request is not a confirmed booking until the property or iThoddoo Maldives confirms it.</p>
    </aside>
  );
}
