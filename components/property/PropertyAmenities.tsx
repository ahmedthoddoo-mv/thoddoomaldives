export default function PropertyAmenities({
  amenities,
}: {
  amenities: string[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {amenities.map((item) => (
        <div
          key={item}
          className="flex items-center gap-4 rounded-2xl border bg-white p-5 text-lg shadow-sm"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-50 text-cyan-700">
            ✓
          </span>
          <span className="font-semibold">{item}</span>
        </div>
      ))}
    </div>
  );
}
