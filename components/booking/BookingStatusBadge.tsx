import type { BookingStatus } from "@/types/booking";

const statusLabels: Record<BookingStatus, string> = {
  draft: "Draft",
  new: "New",
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed"
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <span className={`bookingStatusBadge bookingStatus-${status}`}>{statusLabels[status]}</span>;
}
