import Card from "@/components/ui/Card";
import { buildTripRequestSummary } from "@/lib/planner/plannerSummary";
import type { TripRequest } from "@/types/trip-request";

export default function TripSummary({
  tripRequest,
}: {
  tripRequest: TripRequest;
}) {
  const rows = buildTripRequestSummary(tripRequest);

  return (
    <Card>
      <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
        AI Concierge Foundation
      </p>
      <h2 className="mt-3 text-3xl font-bold">Trip Request Summary</h2>
      <dl className="mt-6 grid gap-4 text-slate-700 md:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="font-semibold text-slate-900">{label}</dt>
            <dd className="mt-1">{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
