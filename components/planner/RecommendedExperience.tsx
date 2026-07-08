import RecommendationCard from "@/components/concierge/RecommendationCard";
import type { TripPlanRecommendation } from "@/types/trip-plan";

export default function RecommendedExperience({
  experience,
}: {
  experience: TripPlanRecommendation;
}) {
  return (
    <RecommendationCard
      recommendation={experience}
      eyebrow="Recommended Experience"
    />
  );
}
