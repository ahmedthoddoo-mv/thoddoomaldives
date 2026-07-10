import { integratedBookings } from "@/data/platformIntegration";
import {
  getSelectedPartnerProfile,
  listPlatformBookings,
  listPlatformCrmNotes,
  listPlatformCrmTasks,
  listPlatformExperiences,
  listPlatformMediaAssets,
  listPlatformMembershipPlans,
  listPlatformPartners,
  listPlatformProperties,
  listPlatformRestaurants,
  listPlatformRooms,
  listPlatformTransfers,
  listPublicGuesthouses
} from "@/lib/platform/repositories";
import {
  getRelationshipForBooking,
  getRelationshipForCrmPartner,
  getRelationshipForPartner,
  getRelationshipForProperty,
  selectedMockPartnerId
} from "@/lib/platform/relationships";
import type { PlatformEntityType, PlatformGuestRecord } from "@/types/platform";

export function getPartnerById(partnerId: string) {
  const relationship = getRelationshipForPartner(partnerId);
  const crmPartner = relationship ? listPlatformPartners().find((partner) => partner.id === relationship.crmPartnerId) : undefined;

  return crmPartner
    ? {
        id: partnerId,
        profile: getSelectedPartnerProfile(),
        crm: crmPartner,
        relationship
      }
    : undefined;
}

export function getPropertyById(propertyId: string) {
  const relationship = getRelationshipForProperty(propertyId);
  return (
    listPlatformProperties().find((property) => property.id === propertyId || property.slug === propertyId) ??
    listPlatformProperties().find((property) => property.id === relationship?.propertyId)
  );
}

export function getPublicGuesthouseForProperty(propertyId: string) {
  const relationship = getRelationshipForProperty(propertyId);
  return listPublicGuesthouses().find((guesthouse) => guesthouse.id === relationship?.propertySlug || guesthouse.slug === relationship?.propertySlug);
}

export function getRoomsForProperty(propertyId: string) {
  const relationship = getRelationshipForProperty(propertyId);
  return relationship ? listPlatformRooms().filter((room) => relationship.roomIds.includes(room.id)) : [];
}

export function getBookingsForProperty(propertyId: string) {
  const relationship = getRelationshipForProperty(propertyId);
  return relationship ? integratedBookings.filter((booking) => relationship.bookingIds.includes(booking.id)) : [];
}

export function getBookingsForPartner(partnerId: string = selectedMockPartnerId) {
  const relationship = getRelationshipForPartner(partnerId);
  return relationship ? integratedBookings.filter((booking) => relationship.bookingIds.includes(booking.id)) : [];
}

export function getBookingById(bookingId: string) {
  return integratedBookings.find((booking) => booking.id === bookingId);
}

export function getGuestRecordForBooking(bookingId: string): PlatformGuestRecord | undefined {
  return getBookingById(bookingId)?.guestRecord;
}

export function getMediaForEntity(entityType: PlatformEntityType, entityId: string) {
  const mediaAssets = listPlatformMediaAssets();

  if (entityType === "property") {
    const relationship = getRelationshipForProperty(entityId);
    return relationship ? mediaAssets.filter((asset) => relationship.mediaAssetIds.includes(asset.id)) : [];
  }

  if (entityType === "partner") {
    const relationship = getRelationshipForPartner(entityId);
    return relationship ? mediaAssets.filter((asset) => relationship.mediaAssetIds.includes(asset.id)) : [];
  }

  return mediaAssets.filter((asset) =>
    asset.usedByEntities?.some((usage) => usage.entityType === entityType && usage.entityId === entityId)
  );
}

export function getExperiencesForProperty(propertyId: string) {
  const relationship = getRelationshipForProperty(propertyId);
  return relationship ? listPlatformExperiences().filter((experience) => relationship.relatedExperienceIds.includes(experience.id)) : [];
}

export function getTransfersForProperty(propertyId: string) {
  const relationship = getRelationshipForProperty(propertyId);
  return relationship ? listPlatformTransfers().filter((transfer) => relationship.transferOptionIds.includes(transfer.id)) : [];
}

export function getRestaurantsForPlatform() {
  return listPlatformRestaurants();
}

export function getCrmRecordForPartner(partnerId: string = selectedMockPartnerId) {
  const relationship = getRelationshipForPartner(partnerId);
  return relationship ? listPlatformPartners().find((partner) => partner.id === relationship.crmPartnerId) : undefined;
}

export function getCrmRecordForProperty(propertyId: string) {
  const relationship = getRelationshipForProperty(propertyId);
  return relationship ? listPlatformPartners().find((partner) => partner.id === relationship.crmPartnerId) : undefined;
}

export function getCrmRecordForBooking(bookingId: string) {
  const relationship = getRelationshipForBooking(bookingId);
  return relationship ? listPlatformPartners().find((partner) => partner.id === relationship.crmPartnerId) : undefined;
}

export function getTasksForPartner(partnerId: string = selectedMockPartnerId) {
  const relationship = getRelationshipForPartner(partnerId);
  return relationship ? listPlatformCrmTasks().filter((task) => task.partnerId === relationship.crmPartnerId) : [];
}

export function getNotesForPartner(partnerId: string = selectedMockPartnerId) {
  const relationship = getRelationshipForPartner(partnerId);
  return relationship ? listPlatformCrmNotes().filter((note) => note.partnerId === relationship.crmPartnerId) : [];
}

export function getMembershipForPartner(partnerId: string = selectedMockPartnerId) {
  const relationship = getRelationshipForPartner(partnerId);
  return relationship ? listPlatformMembershipPlans().find((plan) => plan.name === relationship.membershipPlan) : undefined;
}

export function getPartnerIdForCrmPartner(crmPartnerId: string) {
  return getRelationshipForCrmPartner(crmPartnerId)?.partnerId;
}

export function listIntegratedBookings() {
  return listPlatformBookings().map((booking) => getBookingById(booking.id) ?? booking);
}
