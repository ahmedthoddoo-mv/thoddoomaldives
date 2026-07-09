type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: "teal" | "gold" | "green" | "coral";
};

export function StatCard({ label, value, detail, tone = "teal" }: StatCardProps) {
  return (
    <article className={`adminStatCard adminTone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}
