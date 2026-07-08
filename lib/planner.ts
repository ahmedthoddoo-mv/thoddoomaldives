import type { PlannedTrip, PlannerSearchParams } from "@/types/planner";

const DEFAULT_PHONE = "9609142538";

function getFirstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function getAllValues(value: string | string[] | undefined) {
  if (!value) {
    return [];
  }

  const values = Array.isArray(value) ? value : [value];

  return values
    .flatMap((item) => item.split(","))
    .map((item) => item.trim())
    .filter(Boolean);
}

export function hasPlannerParams(searchParams: PlannerSearchParams) {
  return getFirstValue(searchParams.planner) === "true";
}

export function parsePlannerSearchParams(
  searchParams: PlannerSearchParams
): PlannedTrip | null {
  if (!hasPlannerParams(searchParams)) {
    return null;
  }

  return {
    arrivalDate: getFirstValue(searchParams.arrivalDate),
    departureDate: getFirstValue(searchParams.departureDate),
    adults: getFirstValue(searchParams.adults),
    children: getFirstValue(searchParams.children),
    budgetRange: getFirstValue(searchParams.budgetRange),
    accommodationType: getFirstValue(searchParams.accommodationType),
    interests: getAllValues(searchParams.interests),
  };
}

export function formatPlannerValue(value: string | string[]) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "Not specified";
  }

  return value || "Not specified";
}

export function formatPlannerMessage(plannedTrip: PlannedTrip) {
  return `Hi,

I would like help planning my Maldives trip to Thoddoo.

Your Planned Trip

Arrival: ${formatPlannerValue(plannedTrip.arrivalDate)}
Departure: ${formatPlannerValue(plannedTrip.departureDate)}
Adults: ${formatPlannerValue(plannedTrip.adults)}
Children: ${formatPlannerValue(plannedTrip.children)}
Budget: ${formatPlannerValue(plannedTrip.budgetRange)}
Accommodation: ${formatPlannerValue(plannedTrip.accommodationType)}
Interests: ${formatPlannerValue(plannedTrip.interests)}

Please help me with stays, transfers, and experiences.

Thank you!
iThoddoo Maldives`;
}

export function generatePlannerWhatsAppLink({
  plannedTrip,
  phone = DEFAULT_PHONE,
}: {
  plannedTrip: PlannedTrip;
  phone?: string;
}) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(
    formatPlannerMessage(plannedTrip)
  )}`;
}
