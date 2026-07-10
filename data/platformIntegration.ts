import { adminBookings } from "@/data/bookings";
import { crmNotes, crmPartners, crmTasks } from "@/data/adminCrm";
import { adminManagedProperties } from "@/data/adminContent";
import { mediaAssets } from "@/data/adminCms";
import {
  partnerAnalyticsMetrics,
  partnerGallery,
  partnerMembershipPlans,
  partnerProfile,
  partnerRooms
} from "@/data/partnerPortal";

export type PlatformRelationship = {
  propertyId: string;
  propertySlug: string;
  propertyName: string;
  partnerId: string;
  crmPartnerId: string;
  bookingIds: string[];
  mediaAssetIds: string[];
  roomIds: string[];
  relatedExperienceIds: string[];
  transferOptionIds: string[];
  membershipPlanId: string;
  membershipPlan: string;
  analyticsMetricIds: string[];
};

export const platformRelationships: PlatformRelationship[] = [
  {
    propertyId: "property-thoddoo-sun-sky",
    propertySlug: "thoddoo-sun-sky-inn",
    propertyName: "Thoddoo Sun Sky Inn",
    partnerId: "partner-thoddoo-sun-sky",
    crmPartnerId: "crm-thoddoo-sun-sky",
    bookingIds: ["BK-1007", "BK-1008", "BK-1009"],
    mediaAssetIds: ["media-hero-thoddoo", "media-guesthouse-terrace", "media-room-preview", "media-beach-drone-wide"],
    roomIds: ["room-deluxe", "room-family", "room-garden"],
    relatedExperienceIds: ["turtle-snorkeling", "sandbank-escape", "sunset-fishing"],
    transferOptionIds: ["public-speedboat", "private-speedboat"],
    membershipPlanId: "membership-premium",
    membershipPlan: partnerProfile.membershipPlan,
    analyticsMetricIds: partnerAnalyticsMetrics.map((metric) => metric.label)
  }
];

export const platformLinkedProperties = platformRelationships.map((relationship) => {
  const property = adminManagedProperties.find((item) => item.id === relationship.propertyId);
  const crmPartner = crmPartners.find((partner) => partner.id === relationship.crmPartnerId);
  const bookings = adminBookings.filter((booking) => relationship.bookingIds.includes(booking.id));
  const media = mediaAssets.filter((asset) => relationship.mediaAssetIds.includes(asset.id));

  return {
    relationship,
    property,
    crmPartner,
    bookings,
    media,
    rooms: partnerRooms.filter((room) => relationship.roomIds.includes(room.id)),
    gallery: partnerGallery.filter((image) => media.some((asset) => asset.path === image.path)),
    membership: partnerMembershipPlans.find((plan) => plan.name === relationship.membershipPlan),
    analytics: partnerAnalyticsMetrics
  };
});

export const integratedBookings = adminBookings.map((booking) => {
  const relationship = platformRelationships.find((item) => item.bookingIds.includes(booking.id));
  const crmPartner = relationship ? crmPartners.find((partner) => partner.id === relationship.crmPartnerId) : undefined;
  const property = relationship ? adminManagedProperties.find((item) => item.id === relationship.propertyId) : undefined;

  return {
    ...booking,
    property,
    partner: crmPartner,
    crmRecordId: crmPartner?.id ?? "unlinked",
    guestRecord: {
      id: `guest-${booking.id.toLowerCase()}`,
      name: booking.guest.name,
      whatsapp: booking.guest.whatsapp ?? "Not provided",
      partySize: booking.guest.adults + booking.guest.children
    }
  };
});

export const platformAdminFeed = {
  latestBookings: integratedBookings.slice(0, 3).map((booking) => ({
    title: booking.id,
    detail: `${booking.propertyName} | ${booking.guest.name} | ${booking.status}`,
    meta: booking.arrival
  })),
  latestPartners: crmPartners.slice(0, 4).map((partner) => ({
    title: partner.business,
    detail: `${partner.category} | ${partner.membership} | ${partner.verification}`,
    meta: partner.nextFollowUp
  })),
  latestUploads: mediaAssets.slice(0, 4).map((asset) => ({
    title: asset.filename,
    detail: `${asset.category} | ${asset.usageCount} uses`,
    meta: asset.updatedDate
  })),
  tasks: crmTasks.slice(0, 4).map((task) => ({
    title: task.type,
    detail: `${task.partnerBusiness} | ${task.status}`,
    meta: task.dueDate
  })),
  pendingApprovals: crmPartners
    .filter((partner) => partner.verification !== "Verified")
    .map((partner) => ({
      title: partner.business,
      detail: `${partner.category} | ${partner.verification}`,
      meta: partner.priority
    }))
};

export const platformCrmRelationships = crmPartners.map((partner) => {
  const relationship = platformRelationships.find((item) => item.crmPartnerId === partner.id);
  return {
    partner,
    property: relationship ? adminManagedProperties.find((property) => property.id === relationship.propertyId) : undefined,
    bookings: relationship ? adminBookings.filter((booking) => relationship.bookingIds.includes(booking.id)) : [],
    notes: crmNotes.filter((note) => note.partnerId === partner.id),
    tasks: crmTasks.filter((task) => task.partnerId === partner.id),
    media: relationship ? mediaAssets.filter((asset) => relationship.mediaAssetIds.includes(asset.id)) : [],
    membership: partner.membership
  };
});
