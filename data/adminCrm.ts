export type CrmPartnerCategory = "Guesthouse" | "Restaurant" | "Transfer" | "Excursion" | "Shop";
export type CrmPartnerStatus = "New Lead" | "Pending" | "Contacted" | "Verified" | "Waiting Response" | "Completed";
export type CrmPriority = "Low" | "Medium" | "High" | "Urgent";
export type CrmVerification = "Unverified" | "Pending" | "Verified";
export type CrmMembership = "Free" | "Verified" | "Premium" | "Enterprise";
export type CrmTaskStatus = "Open" | "In Progress" | "Waiting Response" | "Completed";
export type CrmTaskType = "Call Owner" | "Need Photos" | "Need Logo" | "Need Pricing" | "Waiting Response" | "Verified" | "Completed";

export type CrmPartner = {
  id: string;
  business: string;
  owner: string;
  whatsapp: string;
  email: string;
  website: string;
  address: string;
  gps: string;
  category: CrmPartnerCategory;
  status: CrmPartnerStatus;
  leadSource: string;
  priority: CrmPriority;
  lastContact: string;
  nextFollowUp: string;
  notes: string[];
  verification: CrmVerification;
  membership: CrmMembership;
};

export type CrmTask = {
  id: string;
  partnerId: string;
  partnerBusiness: string;
  type: CrmTaskType;
  title: string;
  owner: string;
  dueDate: string;
  status: CrmTaskStatus;
  priority: CrmPriority;
};

export type CrmNote = {
  id: string;
  partnerId: string;
  partnerBusiness: string;
  author: string;
  date: string;
  body: string;
};

export const crmFilterOptions = [
  "All",
  "Guesthouse",
  "Restaurant",
  "Transfer",
  "Excursion",
  "Shop",
  "Pending",
  "Verified",
  "Premium"
] as const;

export const crmPartners: CrmPartner[] = [
  {
    id: "crm-thoddoo-sun-sky",
    business: "Thoddoo Sun Sky Inn",
    owner: "Aminath Haleema",
    whatsapp: "+960 914 2538",
    email: "stay@thoddoosunsky.example",
    website: "https://thoddoosunsky.example",
    address: "Central Thoddoo, Alif Alif Atoll",
    gps: "4.4376, 72.9596",
    category: "Guesthouse",
    status: "Verified",
    leadSource: "Partner onboarding",
    priority: "High",
    lastContact: "Jul 10, 2026",
    nextFollowUp: "Jul 17, 2026",
    notes: ["Owner interested.", "Need better photos.", "Premium dashboard demo shared."],
    verification: "Verified",
    membership: "Premium"
  },
  {
    id: "crm-island-bites",
    business: "Island Bites",
    owner: "Ahmed Sameer",
    whatsapp: "+960 700 3040",
    email: "hello@islandbites.example",
    website: "https://instagram.com/islandbites",
    address: "Main Road, Thoddoo",
    gps: "4.4382, 72.9605",
    category: "Restaurant",
    status: "Pending",
    leadSource: "Local team",
    priority: "Medium",
    lastContact: "Jul 8, 2026",
    nextFollowUp: "Jul 14, 2026",
    notes: ["Need better photos.", "Menu pricing requested."],
    verification: "Pending",
    membership: "Verified"
  },
  {
    id: "crm-blue-channel",
    business: "Blue Channel Speedboat",
    owner: "Ali Nizam",
    whatsapp: "+960 700 5070",
    email: "bookings@bluechannel.example",
    website: "https://bluechannel.example",
    address: "Thoddoo Harbor",
    gps: "4.4369, 72.9579",
    category: "Transfer",
    status: "Contacted",
    leadSource: "Admin import",
    priority: "High",
    lastContact: "Jul 9, 2026",
    nextFollowUp: "Jul 12, 2026",
    notes: ["Will call next Tuesday.", "Need updated airport schedule."],
    verification: "Pending",
    membership: "Premium"
  },
  {
    id: "crm-north-reef",
    business: "North Reef Adventures",
    owner: "Ibrahim Shafiu",
    whatsapp: "+960 700 4050",
    email: "northreef@example.com",
    website: "https://northreef.example",
    address: "Thoddoo Harbor activity desk",
    gps: "4.4371, 72.9587",
    category: "Excursion",
    status: "Waiting Response",
    leadSource: "WhatsApp lead",
    priority: "Medium",
    lastContact: "Jul 7, 2026",
    nextFollowUp: "Jul 15, 2026",
    notes: ["Owner interested.", "Safety notes need review."],
    verification: "Unverified",
    membership: "Free"
  },
  {
    id: "crm-island-bazaar",
    business: "Island Bazaar",
    owner: "Mariyam Zaina",
    whatsapp: "+960 700 6110",
    email: "bazaar@example.com",
    website: "https://instagram.com/islandbazaar",
    address: "Market Street, Thoddoo",
    gps: "4.4386, 72.9615",
    category: "Shop",
    status: "New Lead",
    leadSource: "Walk-in",
    priority: "Low",
    lastContact: "Jul 5, 2026",
    nextFollowUp: "Jul 20, 2026",
    notes: ["Needs logo.", "Potential local souvenir partner."],
    verification: "Unverified",
    membership: "Free"
  }
];

export const crmTasks: CrmTask[] = [
  {
    id: "task-call-owner",
    partnerId: "crm-blue-channel",
    partnerBusiness: "Blue Channel Speedboat",
    type: "Call Owner",
    title: "Call owner to confirm airport transfer support",
    owner: "Operations",
    dueDate: "Jul 12, 2026",
    status: "Open",
    priority: "High"
  },
  {
    id: "task-photos",
    partnerId: "crm-island-bites",
    partnerBusiness: "Island Bites",
    type: "Need Photos",
    title: "Collect hero and food photos",
    owner: "Content",
    dueDate: "Jul 14, 2026",
    status: "In Progress",
    priority: "Medium"
  },
  {
    id: "task-logo",
    partnerId: "crm-island-bazaar",
    partnerBusiness: "Island Bazaar",
    type: "Need Logo",
    title: "Request shop logo and brand colors",
    owner: "Content",
    dueDate: "Jul 20, 2026",
    status: "Open",
    priority: "Low"
  },
  {
    id: "task-pricing",
    partnerId: "crm-north-reef",
    partnerBusiness: "North Reef Adventures",
    type: "Need Pricing",
    title: "Confirm excursion pricing and inclusions",
    owner: "Partnerships",
    dueDate: "Jul 15, 2026",
    status: "Waiting Response",
    priority: "Medium"
  },
  {
    id: "task-verified",
    partnerId: "crm-thoddoo-sun-sky",
    partnerBusiness: "Thoddoo Sun Sky Inn",
    type: "Verified",
    title: "Verification complete and premium profile active",
    owner: "Admin",
    dueDate: "Jul 10, 2026",
    status: "Completed",
    priority: "High"
  }
];

export const crmNotes: CrmNote[] = [
  {
    id: "note-owner-interested",
    partnerId: "crm-thoddoo-sun-sky",
    partnerBusiness: "Thoddoo Sun Sky Inn",
    author: "Admin",
    date: "Jul 10, 2026",
    body: "Owner interested. Premium dashboard demo shared and verification approved."
  },
  {
    id: "note-better-photos",
    partnerId: "crm-island-bites",
    partnerBusiness: "Island Bites",
    author: "Content",
    date: "Jul 8, 2026",
    body: "Need better photos before restaurant page can be featured."
  },
  {
    id: "note-next-tuesday",
    partnerId: "crm-blue-channel",
    partnerBusiness: "Blue Channel Speedboat",
    author: "Operations",
    date: "Jul 9, 2026",
    body: "Will call next Tuesday to confirm route timing and luggage policy."
  },
  {
    id: "note-logo",
    partnerId: "crm-island-bazaar",
    partnerBusiness: "Island Bazaar",
    author: "Partnerships",
    date: "Jul 5, 2026",
    body: "Need logo and owner contact confirmation."
  }
];

export const crmSummaryStats = [
  { label: "CRM Partners", value: String(crmPartners.length), detail: "Mock partner records" },
  { label: "Pending Follow-ups", value: "4", detail: "Due in next 7 days" },
  { label: "Premium Leads", value: "2", detail: "High-value partners" },
  { label: "Open Tasks", value: "4", detail: "Calls, photos, pricing" }
];
