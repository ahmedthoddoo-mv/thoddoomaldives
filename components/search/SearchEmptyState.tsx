export default function SearchEmptyState({
  title = "No results found",
  description = "Try changing your search or removing a filter.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-3xl border bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
        Search
      </p>
      <h2 className="mt-3 text-3xl font-bold">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-slate-600">{description}</p>
    </div>
  );
}
