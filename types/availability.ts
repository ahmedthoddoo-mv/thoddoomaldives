export type AvailabilityProvider = "manual" | "pms" | "channel_manager" | "booking_connectivity_future";
export type AvailabilityStatus = "Available" | "Limited" | "On request" | "Unavailable";

export type RoomAvailability = {
  id: string;
  propertyId: string;
  roomId?: string;
  date: string;
  roomsAvailable: number | null;
  rate: number | null;
  currency: string;
  restrictions: Record<string, unknown>;
  provider: AvailabilityProvider;
  lastSynchronizedAt?: string;
  syncStatus: string;
};
