import type { TripPlan } from "@/types/trip-plan";
import type { TripRequest } from "@/types/trip-request";

export function formatTripRequestValue(value: string | string[]) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "Not specified";
  }

  return value || "Not specified";
}

export function buildTripRequestSummary(tripRequest: TripRequest) {
  return [
    ["Arrival", formatTripRequestValue(tripRequest.arrival)],
    ["Departure", formatTripRequestValue(tripRequest.departure)],
    ["Adults", formatTripRequestValue(tripRequest.adults)],
    ["Children", formatTripRequestValue(tripRequest.children)],
    ["Budget", formatTripRequestValue(tripRequest.budget)],
    ["Accommodation", formatTripRequestValue(tripRequest.accommodationType)],
    ["Interests", formatTripRequestValue(tripRequest.interests)],
    ["Special Requests", formatTripRequestValue(tripRequest.specialRequests)],
  ] as const;
}

export function createEmptyTripPlan(): TripPlan {
  return {
    recommendedGuesthouses: [],
    recommendedExperiences: [],
    recommendedRestaurants: [],
    recommendedTransfers: [],
    estimatedBudget: "Not estimated yet",
    suggestedDailyItinerary: [],
    packingChecklist: [],
  };
}

export function hasTripPlanRecommendations(tripPlan: TripPlan) {
  return (
    tripPlan.recommendedGuesthouses.length > 0 ||
    tripPlan.recommendedExperiences.length > 0 ||
    tripPlan.recommendedRestaurants.length > 0 ||
    tripPlan.recommendedTransfers.length > 0 ||
    tripPlan.suggestedDailyItinerary.length > 0
  );
}
