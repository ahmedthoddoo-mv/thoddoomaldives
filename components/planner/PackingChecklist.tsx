import Card from "@/components/ui/Card";

export default function PackingChecklist({ items }: { items: string[] }) {
  return (
    <Card>
      <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
        Packing Checklist
      </p>
      <ul className="mt-6 grid gap-3 text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="font-bold text-cyan-700">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
