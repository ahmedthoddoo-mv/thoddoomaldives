import Card from "@/components/ui/Card";
import type { DailyItineraryItem } from "@/types/trip-plan";

export default function TripTimeline({
  itinerary,
}: {
  itinerary: DailyItineraryItem[];
}) {
  return (
    <Card>
      <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
        Daily Itinerary
      </p>
      <div className="mt-6 grid gap-5">
        {itinerary.map((item) => (
          <article key={item.day} className="border-l-2 border-cyan-700 pl-5">
            <p className="text-sm font-bold text-cyan-700">{item.day}</p>
            <h3 className="mt-1 text-xl font-bold">{item.title}</h3>
            <p className="mt-2 leading-7 text-slate-600">{item.description}</p>
          </article>
        ))}
      </div>
    </Card>
  );
}
