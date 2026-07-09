type PartnerStatsProps = {
  stats: Array<{
    label: string;
    value: string;
    description: string;
  }>;
};

export function PartnerStats({ stats }: PartnerStatsProps) {
  return (
    <section className="statsBand" aria-label="Partner platform statistics">
      {stats.map((stat) => (
        <div key={stat.label}>
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
          <p>{stat.description}</p>
        </div>
      ))}
    </section>
  );
}
