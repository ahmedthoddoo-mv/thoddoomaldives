"use client";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search iThoddoo Maldives",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="sr-only">Search</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border bg-white px-5 py-4 text-slate-900 shadow-sm outline-none transition focus:border-cyan-700"
      />
    </label>
  );
}
