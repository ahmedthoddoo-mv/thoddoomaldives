import { experiences } from "@/data/experiences";
import { guesthouses } from "@/data/guesthouses";
import { restaurants } from "@/data/restaurants";
import { transfers } from "@/data/transfers";
import type { TripPlan, TripPlanRecommendation } from "@/types/trip-plan";
import type { TripRequest } from "@/types/trip-request";

function matchesInterest(text: string, interests: string[]) {
  const normalizedText = text.toLowerCase();

  return interests.some((interest) =>
    normalizedText.includes(interest.toLowerCase().replace(" ", "-"))
  );
}

function toRecommendation({
  title,
  description,
  href,
}: TripPlanRecommendation): TripPlanRecommendation {
  return { title, description, href };
}

function estimateBudget(tripRequest: TripRequest) {
  const adults = Number(tripRequest.adults) || 2;
  const children = Number(tripRequest.children) || 0;
  const travelers = adults + children;

  if (tripRequest.budget) {
    return `${tripRequest.budget} for ${travelers} traveler${
      travelers === 1 ? "" : "s"
    }`;
  }

  return `Plan for stays, transfers, and experiences for ${travelers} traveler${
    travelers === 1 ? "" : "s"
  }`;
}

function buildPackingChecklist(tripRequest: TripRequest) {
  const items = [
    "Passport and travel documents",
    "Reef-safe sunscreen",
    "Light beachwear and modest island clothing",
    "Swimwear for bikini beach",
    "Reusable water bottle",
    "Phone charger and power adapter",
  ];

  if (tripRequest.interests.includes("Snorkeling")) {
    items.push("Rash guard or swim shirt for snorkeling");
  }

  if (tripRequest.interests.includes("Photography")) {
    items.push("Camera, waterproof pouch, and spare memory card");
  }

  if (tripRequest.interests.includes("Fishing")) {
    items.push("Light long-sleeve layer for evening boat trips");
  }

  return items;
}

export function generateDreamTripPlan(tripRequest: TripRequest): TripPlan {
  const recommendedGuesthouses = guesthouses.slice(0, 1).map((guesthouse) =>
    toRecommendation({
      title: guesthouse.name,
      description: `${guesthouse.tagline} ${guesthouse.distanceToBeach}. From ${guesthouse.priceFrom}.`,
      href: `/stay/${guesthouse.slug}`,
    })
  );

  const matchedExperiences = experiences.filter(
    (experience) =>
      matchesInterest(experience.category, tripRequest.interests) ||
      matchesInterest(experience.title, tripRequest.interests)
  );

  const recommendedExperiences = (
    matchedExperiences.length > 0 ? matchedExperiences : experiences
  )
    .slice(0, 3)
    .map((experience) =>
      toRecommendation({
        title: experience.title,
        description: `${experience.tagline} ${experience.duration}. ${experience.price}.`,
      })
    );

  const recommendedRestaurants = restaurants
    .filter((restaurant) => restaurant.featured)
    .slice(0, 2)
    .map((restaurant) =>
      toRecommendation({
        title: restaurant.name,
        description: `${restaurant.tagline} ${restaurant.location}. ${restaurant.priceRange}.`,
      })
    );

  const recommendedTransfers = transfers
    .filter((transfer) => transfer.featured)
    .slice(0, 2)
    .map((transfer) =>
      toRecommendation({
        title: transfer.title,
        description: `${transfer.duration}. ${transfer.price}. ${transfer.scheduleNote}`,
      })
    );

  return {
    recommendedGuesthouses,
    recommendedExperiences,
    recommendedRestaurants,
    recommendedTransfers,
    estimatedBudget: estimateBudget(tripRequest),
    suggestedDailyItinerary: [
      {
        day: "Day 1",
        title: "Arrival and Island Check-in",
        description:
          "Arrive in Thoddoo, check in, settle down, and enjoy an easy beach walk before dinner.",
      },
      {
        day: "Day 2",
        title: recommendedExperiences[0]?.title ?? "Beach and Snorkeling Day",
        description:
          "Start with a relaxed breakfast, then enjoy your first guided island or lagoon experience.",
      },
      {
        day: "Day 3",
        title: recommendedExperiences[1]?.title ?? "Local Island Day",
        description:
          "Balance adventure with island life, local food, farm areas, and time at Bikini Beach.",
      },
    ],
    packingChecklist: buildPackingChecklist(tripRequest),
  };
}
