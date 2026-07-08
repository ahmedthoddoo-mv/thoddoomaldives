export default function PropertyAmenities({
  amenities,
}: {
  amenities: string[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {amenities.map((item) => (
        <div key={item} className="rounded-2xl border bg-slate-50 p-4 text-lg">
          ✅ {item}
        </div>
      ))}
    </div>
  );
}