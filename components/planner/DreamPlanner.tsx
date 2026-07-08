import RecommendationCard from "@/components/concierge/RecommendationCard";
import BudgetSummary from "@/components/planner/BudgetSummary";
import PackingChecklist from "@/components/planner/PackingChecklist";
import RecommendedExperience from "@/components/planner/RecommendedExperience";
import RecommendedStay from "@/components/planner/RecommendedStay";
import TripTimeline from "@/components/planner/TripTimeline";
import SectionTitle from "@/components/ui/SectionTitle";
import { generateDreamTripPlan } from "@/lib/planner/generateDreamTripPlan";
import type { TripRequest } from "@/types/trip-request";

export default function DreamPlanner({
  tripRequest,
}: {
  tripRequest: TripRequest;
}) {
  const tripPlan = generateDreamTripPlan(tripRequest);

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <SectionTitle
          eyebrow="Dream Vacation Planner"
          title="A rule-based first draft of your Thoddoo trip"
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-6">
            {tripPlan.recommendedGuesthouses.map((stay) => (
              <RecommendedStay key={stay.title} stay={stay} />
            ))}

            <div className="grid gap-6 md:grid-cols-2">
              {tripPlan.recommendedExperiences.map((experience) => (
                <RecommendedExperience
                  key={experience.title}
                  experience={experience}
                />
              ))}
            </div>

            <TripTimeline itinerary={tripPlan.suggestedDailyItinerary} />
          </div>

          <div className="grid gap-6">
            <BudgetSummary estimatedBudget={tripPlan.estimatedBudget} />
            <PackingChecklist items={tripPlan.packingChecklist} />

            {tripPlan.recommendedTransfers.map((transfer) => (
              <RecommendationCard
                key={transfer.title}
                recommendation={transfer}
                eyebrow="Recommended Transfer"
              />
            ))}

            {tripPlan.recommendedRestaurants.map((restaurant) => (
              <RecommendationCard
                key={restaurant.title}
                recommendation={restaurant}
                eyebrow="Recommended Restaurant"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
