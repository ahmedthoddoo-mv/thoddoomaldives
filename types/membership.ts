export type MembershipTier = "free" | "verified" | "premium";

export type MembershipBillingCadence = "free" | "monthly" | "annual";

export type MembershipVisibilityLevel = "standard" | "featured" | "priority";

export interface MembershipFeature {
  id: string;
  label: string;
  description: string;
  includedIn: MembershipTier[];
}

export interface MembershipEntitlements {
  maxPhotos: number | "unlimited";
  verifiedBadge: boolean;
  premiumProfile: boolean;
  featuredSearch: boolean;
  whatsappIntegration: boolean;
  homepageRotation: boolean;
  homepageHeroRotation: boolean;
  tripPlannerIntegration: boolean;
  monthlyInsights: boolean;
  professionalPhotography: boolean;
  video: boolean;
  aiConciergePriority: boolean;
  featuredCampaigns: boolean;
  advancedAnalytics: boolean;
  seasonalPromotions: boolean;
  futureBookingTools: boolean;
}

export interface MembershipPlan {
  tier: MembershipTier;
  name: string;
  tagline: string;
  description: string;
  billingCadence: MembershipBillingCadence;
  visibilityLevel: MembershipVisibilityLevel;
  isRecommended?: boolean;
  entitlements: MembershipEntitlements;
  benefits: string[];
  idealFor: string[];
  futureCapabilities: string[];
}
