import type { MembershipTier } from "./membership";
import type { PartnerCategory } from "./partner";

export type OnboardingStepId =
  | "business-registration"
  | "photo-upload"
  | "rooms-and-services"
  | "verification-review"
  | "verified-partner"
  | "monthly-growth-dashboard";

export interface PartnerOnboardingStep {
  id: OnboardingStepId;
  stepNumber: number;
  title: string;
  description: string;
  owner: "partner" | "ithoddoo";
  futureSystemDependencies: string[];
}

export interface PartnerPlanRecommendation {
  category: PartnerCategory;
  recommendedTier: MembershipTier;
  reasoning: string;
}
