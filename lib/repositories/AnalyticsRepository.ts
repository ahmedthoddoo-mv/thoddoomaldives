import {
  partnerAnalyticsMetrics,
  partnerChartData,
  partnerStats,
  partnerTopCountries
} from "@/data/partnerPortal";
import { createRepository } from "@/lib/repositories/types";

function toId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const analyticsRecords = partnerAnalyticsMetrics.map((metric) => ({
  id: toId(metric.label),
  slug: toId(metric.label),
  label: metric.label,
  title: metric.label,
  value: metric.value,
  change: metric.change,
  featured: ["Page Views", "Booking Requests", "WhatsApp Clicks", "Revenue"].includes(metric.label),
  verified: true
}));

export const AnalyticsRepository = {
  ...createRepository({
    records: analyticsRecords,
    searchFields: ["id", "slug", "title", "value", "change"]
  }),
  findDashboardStats() {
    return partnerStats;
  },
  findChartData() {
    return partnerChartData;
  },
  findTopCountries() {
    return partnerTopCountries;
  }
};
