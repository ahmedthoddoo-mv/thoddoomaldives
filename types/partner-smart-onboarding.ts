import type { MembershipTier } from "@/types/membership";
import type { PartnerApplicationBusinessType } from "@/types/partner-application";
import type { PartnerVerificationDocumentInput } from "@/types/verification-documents";

export type SmartBusinessType = PartnerApplicationBusinessType | "transfer-company";

export type PricingUnit =
  | "per night"
  | "per person"
  | "per trip"
  | "per hour"
  | "per transfer"
  | "per package";

export type PricingCurrency = "USD" | "MVR";

export type PartnerApplicationPriceInput = {
  id: string;
  itemName: string;
  description: string;
  price: string;
  currency: PricingCurrency;
  unit: PricingUnit;
  childPrice: string;
  notes: string;
  active: boolean;
};

export type PartnerApplicationMediaInput = {
  id: string;
  mediaType: "logo" | "cover" | "gallery" | "menu" | "price_list" | "schedule" | "license";
  label: string;
  pathOrNote: string;
  fileName: string;
};

export type SmartPartnerApplicationInput = {
  businessType: SmartBusinessType;
  businessName: string;
  contactPerson: string;
  whatsapp: string;
  email: string;
  island: string;
  address: string;
  googleMapsLink: string;
  website: string;
  instagram: string;
  facebook: string;
  shortDescription: string;
  registrationNumber: string;
  membershipPlan: MembershipTier;
  notes: string;
  categoryAnswers: Record<string, string | boolean>;
  prices: PartnerApplicationPriceInput[];
  media: PartnerApplicationMediaInput[];
  verificationDocuments: PartnerVerificationDocumentInput[];
  antiSpamAnswer: string;
};
