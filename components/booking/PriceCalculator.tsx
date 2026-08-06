import { calculateBookingDraft } from "@/lib/booking";
import type { BookingDraft } from "@/types/booking";

export function PriceCalculator({ draft }: { draft: BookingDraft }) {
  const estimate = calculateBookingDraft(draft);

  return (
    <div className="bookingPriceCalculator">
      <span>{draft.roomRate ? `$${draft.roomRate}/night` : "Price on request"}</span>
      <span>{estimate.nights} nights</span>
      {estimate.accommodation !== null ? <span>${estimate.accommodation} accommodation</span> : null}
      <span>The property will confirm availability and the final price.</span>
      {estimate.total !== null ? <span>${estimate.total} estimated total</span> : null}
    </div>
  );
}
