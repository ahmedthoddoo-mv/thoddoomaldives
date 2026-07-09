import { calculateBookingDraft } from "@/lib/booking";
import type { BookingDraft } from "@/types/booking";

export function PriceCalculator({ draft }: { draft: BookingDraft }) {
  const estimate = calculateBookingDraft(draft);

  return (
    <div className="bookingPriceCalculator">
      <span>{estimate.nights} nights</span>
      <span>${estimate.accommodation} accommodation</span>
      <span>${estimate.total} total</span>
    </div>
  );
}
