"use client";

export type FilterOption = {
  id: string;
  label: string;
  active: boolean;
};

export default function FilterPanel({
  title = "Filters",
  options,
  onToggle,
  onClear,
}: {
  title?: string;
  options: FilterOption[];
  onToggle: (id: string) => void;
  onClear?: () => void;
}) {
  return (
    <aside className="rounded-3xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold">{title}</h2>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-semibold text-cyan-700"
          >
            Clear
          </button>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onToggle(option.id)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              option.active
                ? "border-cyan-700 bg-cyan-700 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-cyan-700"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
