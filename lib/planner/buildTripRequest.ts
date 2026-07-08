import type { PlannedTrip } from "@/types/planner";
import type { TripRequest } from "@/types/trip-request";

export function buildTripRequest({
  plannedTrip,
  specialRequests = "",
}: {
  plannedTrip: PlannedTrip;
  specialRequests?: string;
}): TripRequest {
  return {
    arrival: plannedTrip.arrivalDate,
    departure: plannedTrip.departureDate,
    adults: plannedTrip.adults,
    children: plannedTrip.children,
    budget: plannedTrip.budgetRange,
    accommodationType: plannedTrip.accommodationType,
    interests: plannedTrip.interests,
    specialRequests,
  };
}

export function createEmptyTripRequest(): TripRequest {
  return {
    arrival: "",
    departure: "",
    adults: "",
    children: "",
    budget: "",
    accommodationType: "",
    interests: [],
    specialRequests: "",
  };
}
