import { availabilityFreshness, availabilityStatus } from "@/lib/availability/status";
import type { RoomAvailability } from "@/types/availability";

export function PropertyAvailabilityCard({ availability = [] }: { availability?: RoomAvailability[] }) {
  const next = availability[0];
  return (
    <article className="propertyAvailabilityCard">
      <p className="eyebrow">Request availability</p>
      <h3>{availabilityStatus(next)}</h3>
      <p>{next ? `${next.date}: ${next.roomsAvailable ?? "Rooms"} ${next.roomsAvailable === 1 ? "room" : "rooms"} shown.` : "Availability is confirmed personally."}</p>
      <p>{next ? availabilityFreshness(next) : "The property will confirm availability and the final price after receiving your enquiry."}</p>
    </article>
  );
}
