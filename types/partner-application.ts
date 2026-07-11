import type { MembershipTier } from "@/types/membership";

export type PartnerApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "changes_requested"
  | "approved"
  | "rejected"
  | "withdrawn";

export type PartnerApplicationBusinessType =
  | "guesthouse"
  | "hotel"
  | "restaurant"
  | "cafe"
  | "speedboat-company"
  | "ferry-operator"
  | "excursion-operator"
  | "dive-center"
  | "watersports"
  | "shop"
  | "photographer"
  | "wellness"
  | "farm-experience"
  | "local-guide"
  | "other";

export type PartnerApplicationTimelineType =
  | "submitted"
  | "review_started"
  | "changes_requested"
  | "resubmitted"
  | "approved"
  | "rejected"
  | "reopened"
  | "partner_created"
  | "listing_created"
  | "listing_published"
  | "note";

export type PartnerApplicationTimelineEvent = {
  id: string;
  type: PartnerApplicationTimelineType;
  label: string;
  detail: string;
  date: string;
  actor: string;
};

export type PartnerApplicationListingWorkflow =
  | "property"
  | "restaurant"
  | "transfer"
  | "experience"
  | "business";

export type PartnerApplicationRecord = {
  id: string;
  businessName: string;
  businessType: PartnerApplicationBusinessType;
  contactPerson: string;
  whatsapp: string;
  email: string;
  island: string;
  address: string;
  description: string;
  services: string;
  websiteOrSocial: string;
  requestedMembershipTier: MembershipTier;
  mediaNotes: string;
  submittedDate: string;
  updatedDate: string;
  status: PartnerApplicationStatus;
  assignedReviewer: string;
  adminNotes: string[];
  requestedChanges: string[];
  linkedPartnerId?: string;
  linkedListingId?: string;
  listingWorkflow: PartnerApplicationListingWorkflow;
  listingPublicationStatus: "draft" | "pending" | "published" | "archived";
  verificationStatus: "unverified" | "pending" | "verified" | "rejected";
  timeline: PartnerApplicationTimelineEvent[];
};

export type PartnerApplicationFilters = {
  search: string;
  status: PartnerApplicationStatus | "all";
  businessType: PartnerApplicationBusinessType | "all";
  membershipTier: MembershipTier | "all";
  sort: "newest" | "oldest";
};

export type ApplicationDecisionResult = {
  application: PartnerApplicationRecord;
  message: string;
};
