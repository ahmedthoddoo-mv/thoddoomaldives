import Card from "@/components/ui/Card";
import type { TripPlanRecommendation } from "@/types/trip-plan";

export default function RecommendationCard({
  recommendation,
  eyebrow,
}: {
  recommendation: TripPlanRecommendation;
  eyebrow: string;
}) {
  return (
    <Card>
      <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-2xl font-bold">{recommendation.title}</h3>
      <p className="mt-3 leading-7 text-slate-600">
        {recommendation.description}
      </p>
      {recommendation.href && (
        <a
          href={recommendation.href}
          className="mt-5 inline-block font-semibold text-cyan-700 hover:text-cyan-900"
        >
          View Details
        </a>
      )}
    </Card>
  );
}
