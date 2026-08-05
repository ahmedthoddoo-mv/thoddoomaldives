import type { AvailabilityStatus, RoomAvailability } from "@/types/availability";

export function availabilityStatus(entry?: Pick<RoomAvailability, "roomsAvailable">): AvailabilityStatus {
  if (!entry || entry.roomsAvailable === null) return "On request";
  if (entry.roomsAvailable === 0) return "Unavailable";
  if (entry.roomsAvailable <= 2) return "Limited";
  return "Available";
}

export function availabilityFreshness(entry: Pick<RoomAvailability, "provider" | "lastSynchronizedAt" | "syncStatus">) {
  if (entry.provider === "manual") return "Manual calendar — confirm with the property";
  if (!entry.lastSynchronizedAt) return "Provider connection pending";
  const prefix = entry.syncStatus === "stale" || entry.syncStatus === "error" ? "Last successful synchronization" : "Last synchronized";
  return `${prefix}: ${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Indian/Maldives" }).format(new Date(entry.lastSynchronizedAt))}`;
}
