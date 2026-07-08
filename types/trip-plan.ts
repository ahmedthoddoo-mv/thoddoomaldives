export type TripPlanRecommendation = {
  title: string;
  description: string;
  href?: string;
};

export type DailyItineraryItem = {
  day: string;
  title: string;
  description: string;
};

export type TripPlan = {
  recommendedGuesthouses: TripPlanRecommendation[];
  recommendedExperiences: TripPlanRecommendation[];
  recommendedRestaurants: TripPlanRecommendation[];
  recommendedTransfers: TripPlanRecommendation[];
  estimatedBudget: string;
  suggestedDailyItinerary: DailyItineraryItem[];
  packingChecklist: string[];
};
