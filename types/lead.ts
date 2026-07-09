import type { PartnerCategory } from "./partner";

export type LeadSource =
  | "partner-profile"
  | "homepage"
  | "search"
  | "trip-planner"
  | "ai-concierge"
  | "campaign";

export type LeadIntent =
  | "stay"
  | "transfer"
  | "activity"
  | "dining"
  | "shopping"
  | "wellness"
  | "local-service";

export type LeadStatus = "new" | "sent-to-partner" | "responded" | "converted" | "closed";

export interface PartnerLead {
  id: string;
  partnerId: string;
  partnerCategory: PartnerCategory;
  source: LeadSource;
  intent: LeadIntent;
  status: LeadStatus;
  createdAt: string;
  message?: string;
  futureCustomerProfileId?: string;
}
