import Card from "@/components/ui/Card";

export default function BudgetSummary({
  estimatedBudget,
}: {
  estimatedBudget: string;
}) {
  return (
    <Card>
      <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
        Estimated Budget
      </p>
      <p className="mt-4 text-3xl font-bold">{estimatedBudget}</p>
      <p className="mt-3 leading-7 text-slate-600">
        Final pricing depends on confirmed rooms, transfers, group size,
        excursion availability, and weather conditions.
      </p>
    </Card>
  );
}
