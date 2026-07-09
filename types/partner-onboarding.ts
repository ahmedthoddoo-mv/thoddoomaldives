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
  rooms: string;
  checkInOut: string;
  amenities: string;
  cuisine: string;
  openingHours: string;
  menuNotes: string;
  boatName: string;
  capacity: string;
  departureTimes: string;
  airportTransferSupport: string;
  activityType: string;
  duration: string;
  includedItems: string;
  notes: string;
}

export type PartnerOnboardingFieldName = keyof PartnerOnboardingApplication;
