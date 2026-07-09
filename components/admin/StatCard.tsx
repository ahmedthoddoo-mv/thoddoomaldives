import { AdminStatCard } from "@/components/admin/AdminStatCard";

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: "teal" | "gold" | "green" | "coral";
};

export function StatCard({ label, value, detail, tone = "teal" }: StatCardProps) {
  return <AdminStatCard label={label} value={value} detail={detail} tone={tone} />;
}
