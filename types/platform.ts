export type PlatformEntityType =
  | "partner"
  | "property"
  | "room"
  | "booking"
  | "guest"
  | "media"
  | "restaurant"
  | "experience"
  | "transfer"
  | "crm-task"
  | "crm-note"
  | "membership";

export type PlatformPublicationStatus = "Draft" | "Published" | "Archived";
export type PlatformVerificationStatus = "Unverified" | "Pending" | "Verified" | "Suspended";
export type PlatformMembershipTier = "Free" | "Verified" | "Premium" | "Enterprise";
export type PlatformPartnerCategory = "Guesthouse" | "Restaurant" | "Transfer" | "Excursion" | "Shop";

export type PlatformEntityReference = {
  entityType: PlatformEntityType;
  entityId: string;
  usage: string;
};

export type PlatformGuestRecord = {
  id: string;
  name: string;
  whatsapp: string;
  partySize: number;
};
