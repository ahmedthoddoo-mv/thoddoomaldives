import type { MembershipFeature, MembershipPlan } from "@/types/membership";
import type { PartnerOnboardingStep } from "@/types/partner-plan";

export const membershipPlans: MembershipPlan[] = [
  {
    tier: "free",
    name: "Free",
    tagline: "Be discoverable",
    description: "A structured listing for legitimate island businesses that need a clean presence on iThoddoo Maldives.",
    billingCadence: "free",
    visibilityLevel: "standard",
    entitlements: {
      maxPhotos: 5,
      verifiedBadge: false,
      premiumProfile: false,
      featuredSearch: false,
      whatsappIntegration: false,
      homepageRotation: false,
      homepageHeroRotation: false,
      tripPlannerIntegration: false,
      monthlyInsights: false,
      professionalPhotography: false,
      video: false,
      aiConciergePriority: false,
      featuredCampaigns: false,
      advancedAnalytics: false,
      seasonalPromotions: false,
      futureBookingTools: false
    },
    benefits: ["Basic listing", "Contact details", "Five photos", "Business information"],
    idealFor: ["New businesses", "Small local services", "Partners validating demand"],
    futureCapabilities: ["Upgrade path to verification", "Lead history once CRM exists"]
  },
  {
    tier: "verified",
    name: "Verified",
    tagline: "Build trust and demand",
    description: "A growth profile for partners ready to earn more visibility, traveler trust, and qualified leads.",
    billingCadence: "monthly",
    visibilityLevel: "featured",
    isRecommended: true,
    entitlements: {
      maxPhotos: 20,
      verifiedBadge: true,
      premiumProfile: true,
      featuredSearch: true,
      whatsappIntegration: true,
      homepageRotation: true,
      homepageHeroRotation: false,
      tripPlannerIntegration: true,
      monthlyInsights: true,
      professionalPhotography: false,
      video: false,
      aiConciergePriority: false,
      featuredCampaigns: false,
      advancedAnalytics: false,
      seasonalPromotions: false,
      futureBookingTools: false
    },
    benefits: [
      "Verified badge",
      "Premium profile",
      "Featured search",
      "More photos",
      "WhatsApp integration",
      "Homepage rotation",
      "Trip Planner integration",
      "Monthly insights"
    ],
    idealFor: ["Guesthouses", "Experience operators", "Restaurants", "Transport providers"],
    futureCapabilities: ["Lead quality scoring", "Partner dashboard", "Seasonal visibility planning"]
  },
  {
    tier: "premium",
    name: "Premium",
    tagline: "Compete at destination scale",
    description: "A strategic growth plan for partners that want campaign placement, richer media, and priority demand generation.",
    billingCadence: "monthly",
    visibilityLevel: "priority",
    entitlements: {
      maxPhotos: "unlimited",
      verifiedBadge: true,
      premiumProfile: true,
      featuredSearch: true,
      whatsappIntegration: true,
      homepageRotation: true,
      homepageHeroRotation: true,
      tripPlannerIntegration: true,
      monthlyInsights: true,
      professionalPhotography: true,
      video: true,
      aiConciergePriority: true,
      featuredCampaigns: true,
      advancedAnalytics: true,
      seasonalPromotions: true,
      futureBookingTools: true
    },
    benefits: [
      "Everything in Verified",
      "Professional photography",
      "Video",
      "AI Concierge priority",
      "Featured campaigns",
      "Homepage hero rotation",
      "Advanced analytics",
      "Seasonal promotions",
      "Future booking tools"
    ],
    idealFor: ["Market leaders", "High-capacity operators", "Partners investing in year-round growth"],
    futureCapabilities: ["Booking tools", "Campaign attribution", "Revenue intelligence"]
  }
];

export const membershipFeatures: MembershipFeature[] = [
  {
    id: "basic-listing",
    label: "Basic listing",
    description: "Structured profile with essential business information.",
    includedIn: ["free", "verified", "premium"]
  },
  {
    id: "verified-badge",
    label: "Verified badge",
    description: "Trust signal after iThoddoo Maldives review.",
    includedIn: ["verified", "premium"]
  },
  {
    id: "trip-planner",
    label: "Trip Planner integration",
    description: "Eligible services can be recommended inside traveler planning flows.",
    includedIn: ["verified", "premium"]
  },
  {
    id: "advanced-analytics",
    label: "Advanced analytics",
    description: "Deeper future reporting for demand, campaigns, and conversion.",
    includedIn: ["premium"]
  }
];

export const partnerOnboardingSteps: PartnerOnboardingStep[] = [
  {
    id: "business-registration",
    stepNumber: 1,
    title: "Business registration",
    description: "Collect business category, ownership, location, contact, and operating basics.",
    owner: "partner",
    futureSystemDependencies: ["Authentication", "Partner account model"]
  },
  {
    id: "photo-upload",
    stepNumber: 2,
    title: "Upload photos",
    description: "Add gallery assets with plan-aware media limits and quality guidance.",
    owner: "partner",
    futureSystemDependencies: ["Media storage", "Image moderation"]
  },
  {
    id: "rooms-and-services",
    stepNumber: 3,
    title: "Add rooms and services",
    description: "Create reusable offerings that can later connect to booking, itinerary, and concierge tools.",
    owner: "partner",
    futureSystemDependencies: ["Inventory model", "Booking engine"]
  },
  {
    id: "verification-review",
    stepNumber: 4,
    title: "Verification review",
    description: "iThoddoo Maldives reviews eligibility, content quality, and partner fit.",
    owner: "ithoddoo",
    futureSystemDependencies: ["Admin dashboard", "Review workflow"]
  },
  {
    id: "verified-partner",
    stepNumber: 5,
    title: "Verified Partner",
    description: "Approved partners receive trust signals and growth placements based on membership.",
    owner: "ithoddoo",
    futureSystemDependencies: ["Search ranking", "Homepage rotation"]
  },
  {
    id: "monthly-growth-dashboard",
    stepNumber: 6,
    title: "Monthly growth dashboard",
    description: "Partners review demand, leads, content performance, and recommendations.",
    owner: "ithoddoo",
    futureSystemDependencies: ["Analytics pipeline", "CRM", "Reporting dashboard"]
  }
];
