export type PlannerSearchParams = Record<
  string,
  string | string[] | undefined
>;

export type PlannedTrip = {
  arrivalDate: string;
  departureDate: string;
  adults: string;
  children: string;
  budgetRange: string;
  accommodationType: string;
  interests: string[];
};
