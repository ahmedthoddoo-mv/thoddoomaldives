import RecommendationCard from "@/components/concierge/RecommendationCard";
import type { TripPlanRecommendation } from "@/types/trip-plan";

export default function RecommendedStay({
  stay,
}: {
  stay: TripPlanRecommendation;
}) {
  return <RecommendationCard recommendation={stay} eyebrow="Recommended Stay" />;
}
