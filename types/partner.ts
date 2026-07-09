import type { MembershipTier } from "./membership";

export type PartnerCategory =
  | "guesthouse"
  | "hotel"
  | "speedboat-company"
  | "ferry-operator"
  | "dive-center"
  | "watersports"
  | "restaurant"
  | "cafe"
  | "photographer"
  | "taxi-service"
  | "shop"
  | "wellness-spa"
  | "tour-guide";

export type PartnerVerificationStatus =
  | "draft"
  | "submitted"
  | "under-review"
  | "verified"
  | "needs-updates";

export interface PartnerContact {
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  instagram?: string;
}

export interface PartnerLocation {
  island: "Thoddoo";
  atoll: "Alif Alif";
  address?: string;
  mapUrl?: string;
}

export interface PartnerMedia {
  coverImage: string;
  photos: string[];
  videoUrl?: string;
  hasProfessionalPhotography: boolean;
}

export interface PartnerService {
  id: string;
  name: string;
  description: string;
  category: "room" | "transfer" | "activity" | "dining" | "retail" | "wellness" | "local-service";
  startingPriceLabel?: string;
  isBookableInFuture: boolean;
}

export interface Partner {
  id: string;
  slug: string;
  name: string;
  category: PartnerCategory;
  membershipTier: MembershipTier;
  verificationStatus: PartnerVerificationStatus;
  shortDescription: string;
  description: string;
  contact: PartnerContact;
  location: PartnerLocation;
  media: PartnerMedia;
  services: PartnerService[];
  tags: string[];
  joinedAt: string;
  isHomepageEligible: boolean;
  isTripPlannerEligible: boolean;
}

export interface PartnerCategoryDefinition {
  id: PartnerCategory;
  label: string;
  pluralLabel: string;
  description: string;
  defaultServiceType: PartnerService["category"];
}
