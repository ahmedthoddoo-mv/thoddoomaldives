import type { MembershipTier } from "./membership";

export type AnalyticsMetricId =
  | "profile-views"
  | "lead-clicks"
  | "whatsapp-clicks"
  | "trip-planner-adds"
  | "homepage-impressions"
  | "campaign-impressions"
  | "conversion-rate";

export interface PartnerAnalyticsMetric {
  id: AnalyticsMetricId;
  label: string;
  description: string;
  availableFrom: MembershipTier;
  isFutureMetric: boolean;
}

export interface PartnerMonthlyInsight {
  partnerId: string;
  month: string;
  profileViews: number;
  leadClicks: number;
  whatsappClicks: number;
  tripPlannerAdds: number;
  recommendation: string;
}
