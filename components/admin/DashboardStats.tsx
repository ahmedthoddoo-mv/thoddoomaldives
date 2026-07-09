import { StatCard } from "@/components/admin/StatCard";

type DashboardStat = {
  label: string;
  value: string;
  detail: string;
  tone?: "teal" | "gold" | "green" | "coral";
};

type DashboardStatsProps = {
  stats: DashboardStat[];
};

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <section className="adminStatsGrid" aria-label="Admin dashboard statistics">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </section>
  );
}
