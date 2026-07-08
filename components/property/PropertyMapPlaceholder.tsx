import type { Guesthouse } from "@/types/guesthouse";

export default function PropertyMapPlaceholder({
  guesthouse,
}: {
  guesthouse: Guesthouse;
}) {
  return (
    <div className="rounded-3xl border bg-slate-100 p-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
        Map
      </p>
      <h3 className="mt-3 text-2xl font-bold">{guesthouse.location}</h3>
      <div className="mt-6 flex min-h-80 items-center justify-center rounded-3xl bg-white text-center text-slate-500">
        <div>
          <p className="font-semibold text-slate-700">Google Maps Placeholder</p>
          <p className="mt-2 text-sm">
            Future integration will show exact property location, beach access,
            and nearby points of interest.
          </p>
        </div>
      </div>
    </div>
  );
}
