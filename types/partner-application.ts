import type { MembershipTier } from "@/types/membership";
import type { PartnerVerificationDocumentInput } from "@/types/verification-documents";
import type { BusinessType } from "@/types/business-type";

export type PartnerApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "changes_requested"
  | "approved"
  | "rejected"
  | "withdrawn";

export type PartnerApplicationBusinessType = BusinessType;
export type PartnerApplicationWorkflowSource = "partner_submitted" | "admin_created";

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
  source: PartnerApplicationWorkflowSource;
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
  linkedPartnerName?: string;
  linkedListingId?: string;
  ownerInvitationStatus?: "pending" | "accepted";
  listingWorkflow: PartnerApplicationListingWorkflow;
  listingPublicationStatus: "draft" | "pending" | "published" | "archived";
  verificationStatus: "unverified" | "pending" | "verified" | "rejected";
  verificationDocuments?: PartnerVerificationDocumentInput[];
  verificationCompletion?: number;
  submittedFields?: Array<{ label: string; value: string }>;
  pricingRows?: Array<{ name: string; price: string; unit: string }>;
  publicMedia?: Array<{ id: string; label: string; status: string; selected: boolean; rightsConfirmed: boolean }>;
  reviewValues?: {
    common: Record<string, string>;
    category: Record<string, string>;
    prices: Array<{ name: string; price: string; currency: string; unit: string }>;
    verificationNotes: string;
    publicMediaIds: string[];
    mediaRightsConfirmed: boolean;
    editedAt?: string;
    editedBy?: string;
  };
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
