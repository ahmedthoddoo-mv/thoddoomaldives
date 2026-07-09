import type { MembershipTier } from "./membership";
import type { PartnerCategory } from "./partner";

export interface PartnerOnboardingApplication {
  businessName: string;
  businessType: PartnerCategory | "other";
  contactPerson: string;
  whatsappNumber: string;
  email: string;
  island: string;
  address: string;
  shortDescription: string;
  servicesOffered: string;
  serviceCount: string;
  priceRange: string;
  websiteOrSocial: string;
  photoNotes: string;
  membershipInterest: MembershipTier;
  notes: string;
}

export type PartnerOnboardingFieldName = keyof PartnerOnboardingApplication;
