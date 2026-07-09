type AdminStatCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: "teal" | "gold" | "green" | "coral";
};

export function AdminStatCard({ label, value, detail, tone = "teal" }: AdminStatCardProps) {
  return (
    <article className={`adminStatCard adminTone-${tone}`}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <p>{detail}</p>
    </article>
  );
}
