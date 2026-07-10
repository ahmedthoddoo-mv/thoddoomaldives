import { platformRelationships } from "@/data/platformIntegration";

export const selectedMockPartnerId = "partner-thoddoo-sun-sky";

export function listPlatformRelationships() {
  return platformRelationships;
}

export function getRelationshipForPartner(partnerId: string) {
  return platformRelationships.find((relationship) => relationship.partnerId === partnerId);
}

export function getRelationshipForProperty(propertyId: string) {
  return platformRelationships.find(
    (relationship) => relationship.propertyId === propertyId || relationship.propertySlug === propertyId
  );
}

export function getRelationshipForCrmPartner(crmPartnerId: string) {
  return platformRelationships.find((relationship) => relationship.crmPartnerId === crmPartnerId);
}

export function getRelationshipForBooking(bookingId: string) {
  return platformRelationships.find((relationship) => relationship.bookingIds.includes(bookingId));
}
