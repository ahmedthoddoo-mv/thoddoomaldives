import type { PartnerApplicationRecord } from "@/types/partner-application";

export type ApplicationOwnerState = {
  kind: "none" | "linked" | "pending" | "listing_only";
  title: string;
  detail: string;
};

export function getApplicationOwnerState(application: Pick<PartnerApplicationRecord, "linkedPartnerId" | "linkedPartnerName" | "linkedListingId" | "ownerInvitationStatus" | "email">): ApplicationOwnerState {
  if (application.ownerInvitationStatus === "pending") {
    return {
      kind: "pending",
      title: "Invitation pending",
      detail: application.email
        ? `An invitation is waiting for ${application.email}.`
        : "An invitation is pending for this owner."
    };
  }

  if (application.linkedPartnerId) {
    return {
      kind: "linked",
      title: "Partner already linked",
      detail: application.linkedPartnerName
        ? `Owner access is already connected to ${application.linkedPartnerName}.`
        : "This application is already linked to a partner account."
    };
  }

  if (application.linkedListingId) {
    return {
      kind: "listing_only",
      title: "Listing exists but owner is not linked",
      detail: "A business listing exists, but the application still needs an owner or partner link."
    };
  }

  return {
    kind: "none",
    title: "No owner linked",
    detail: "No partner account or owner invitation is linked to this application yet."
  };
}
