export default function PropertyAmenities({
  amenities,
}: {
  amenities: string[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {amenities.map((item) => (
        <div
          key={item}
          className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:shadow-md"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-cyan-700">
            ✓
          </span>
          <span className="font-semibold leading-6 text-slate-800">{item}</span>
        </div>
      ))}
    </div>
  );
}
