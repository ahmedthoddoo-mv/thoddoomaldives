import type {
  PartnerApplicationBusinessType,
  PartnerApplicationRecord,
  PartnerApplicationStatus
} from "@/types/partner-application";
import type { MembershipTier } from "@/types/membership";

export const partnerApplicationBusinessTypes: Array<{
  value: PartnerApplicationBusinessType;
  label: string;
}> = [
  { value: "guesthouse", label: "Guesthouse" },
  { value: "hotel", label: "Hotel" },
  { value: "restaurant", label: "Restaurant" },
  { value: "cafe", label: "Cafe" },
  { value: "speedboat-company", label: "Speedboat Company" },
  { value: "ferry-operator", label: "Ferry Operator" },
  { value: "excursion-operator", label: "Excursion Operator" },
  { value: "dive-center", label: "Dive Center" },
  { value: "watersports", label: "Watersports" },
  { value: "shop", label: "Shop" },
  { value: "photographer", label: "Photographer" },
  { value: "wellness", label: "Wellness" },
  { value: "farm-experience", label: "Farm Experience" },
  { value: "local-guide", label: "Local Guide" },
  { value: "other", label: "Other" }
];

export const partnerApplicationStatuses: Array<{
  value: PartnerApplicationStatus;
  label: string;
}> = [
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "changes_requested", label: "Changes requested" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" }
];

export const requestedChangeOptions = [
  "Missing photos",
  "Missing prices",
  "Incomplete contact details",
  "Weak description",
  "Registration details needed",
  "More verification documents required",
  "Unclear location",
  "Missing policies"
];

export const partnerApplicationMembershipTiers: MembershipTier[] = ["free", "verified", "premium"];

export const defaultPartnerApplications: PartnerApplicationRecord[] = [
  {
    id: "app-palm-garden",
    businessName: "Palm Garden Thoddoo",
    businessType: "guesthouse",
    contactPerson: "Aisha Rasheed",
    whatsapp: "+960 700 1020",
    email: "hello@palmgarden.example",
    island: "Thoddoo",
    address: "Palm Garden Road, Thoddoo",
    description: "Small family-run guesthouse with garden rooms, breakfast, and airport transfer coordination.",
    services: "8 rooms, breakfast, bicycles, laundry support",
    websiteOrSocial: "instagram.com/palmgardenthoddoo",
    requestedMembershipTier: "verified",
    mediaNotes: "Owner can share 18 photos after review.",
    submittedDate: "2026-07-09T09:30:00.000Z",
    updatedDate: "2026-07-10T11:20:00.000Z",
    status: "under_review",
    assignedReviewer: "Ahmed",
    adminNotes: ["Good fit for verified guesthouse pipeline."],
    requestedChanges: [],
    linkedPartnerId: "crm-palm-garden",
    linkedListingId: "property-palm-garden",
    listingWorkflow: "property",
    listingPublicationStatus: "pending",
    verificationStatus: "pending",
    timeline: [
      {
        id: "app-palm-garden-submitted",
        type: "submitted",
        label: "Application submitted",
        detail: "Partner application received from onboarding form.",
        date: "2026-07-09T09:30:00.000Z",
        actor: "Partner"
      },
      {
        id: "app-palm-garden-review",
        type: "review_started",
        label: "Review started",
        detail: "Assigned to Ahmed for verification checks.",
        date: "2026-07-10T11:20:00.000Z",
        actor: "Admin"
      }
    ]
  },
  {
    id: "app-lagoon-bite",
    businessName: "Lagoon Bite Cafe",
    businessType: "cafe",
    contactPerson: "Hassan Shareef",
    whatsapp: "+960 720 4455",
    email: "lagoonbite@example.com",
    island: "Thoddoo",
    address: "Harbour Road, Thoddoo",
    description: "Cafe serving juices, local breakfast, seafood rice, and group dinner requests.",
    services: "Cafe menu, takeaway, small group meals",
    websiteOrSocial: "facebook.com/lagoonbite",
    requestedMembershipTier: "free",
    mediaNotes: "Needs food photos and menu images.",
    submittedDate: "2026-07-08T14:05:00.000Z",
    updatedDate: "2026-07-10T08:00:00.000Z",
    status: "changes_requested",
    assignedReviewer: "Naza",
    adminNotes: ["Promising dining partner, but menu details are thin."],
    requestedChanges: ["Missing photos", "Missing prices", "Weak description"],
    listingWorkflow: "restaurant",
    listingPublicationStatus: "draft",
    verificationStatus: "unverified",
    timeline: [
      {
        id: "app-lagoon-submitted",
        type: "submitted",
        label: "Application submitted",
        detail: "Cafe application received.",
        date: "2026-07-08T14:05:00.000Z",
        actor: "Partner"
      },
      {
        id: "app-lagoon-changes",
        type: "changes_requested",
        label: "Changes requested",
        detail: "Admin requested photos, prices, and a stronger description.",
        date: "2026-07-10T08:00:00.000Z",
        actor: "Admin"
      }
    ]
  },
  {
    id: "app-blue-channel",
    businessName: "Blue Channel Transfers",
    businessType: "speedboat-company",
    contactPerson: "Ibrahim Latheef",
    whatsapp: "+960 777 3001",
    email: "ops@bluechannel.example",
    island: "Thoddoo",
    address: "Thoddoo Harbour",
    description: "Scheduled and private speedboat transfer support between Male, airport, and Thoddoo.",
    services: "Daily transfers, airport meet-and-assist, private charters",
    websiteOrSocial: "bluechannel.example",
    requestedMembershipTier: "premium",
    mediaNotes: "Has boat photos and timetable PDF.",
    submittedDate: "2026-07-07T07:45:00.000Z",
    updatedDate: "2026-07-11T06:15:00.000Z",
    status: "approved",
    assignedReviewer: "Ahmed",
    adminNotes: ["Approved for premium transfer workflow. Listing remains draft until timetable is checked."],
    requestedChanges: [],
    linkedPartnerId: "partner-blue-channel",
    linkedListingId: "transfer-blue-channel",
    listingWorkflow: "transfer",
    listingPublicationStatus: "draft",
    verificationStatus: "verified",
    timeline: [
      {
        id: "app-blue-submitted",
        type: "submitted",
        label: "Application submitted",
        detail: "Transfer company application received.",
        date: "2026-07-07T07:45:00.000Z",
        actor: "Partner"
      },
      {
        id: "app-blue-approved",
        type: "approved",
        label: "Application approved",
        detail: "Partner record created and transfer listing drafted.",
        date: "2026-07-11T06:15:00.000Z",
        actor: "Admin"
      }
    ]
  }
];

export function getPartnerApplicationBusinessTypeLabel(value: PartnerApplicationBusinessType) {
  return partnerApplicationBusinessTypes.find((type) => type.value === value)?.label ?? "Other";
}

export function getPartnerApplicationStatusLabel(value: PartnerApplicationStatus) {
  return partnerApplicationStatuses.find((status) => status.value === value)?.label ?? value;
}
