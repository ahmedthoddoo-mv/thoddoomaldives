import { crmNotes, crmPartners, crmTasks } from "@/data/adminCrm";
import { adminManagedProperties } from "@/data/adminContent";
import { adminBookings } from "@/data/bookings";
import { mediaAssets } from "@/data/adminCms";
import { experiences } from "@/data/experiences";
import { guesthouses } from "@/data/guesthouses";
import { partnerMembershipPlans, partnerProfile, partnerRooms } from "@/data/partnerPortal";
import { restaurants } from "@/data/restaurants";
import { transfers } from "@/data/transfers";

export function listPlatformPartners() {
  return crmPartners;
}

export function listPlatformProperties() {
  return adminManagedProperties;
}

export function listPublicGuesthouses() {
  return guesthouses;
}

export function listPlatformRooms() {
  return partnerRooms;
}

export function listPlatformBookings() {
  return adminBookings;
}

export function listPlatformMediaAssets() {
  return mediaAssets;
}

export function listPlatformExperiences() {
  return experiences;
}

export function listPlatformTransfers() {
  return transfers;
}

export function listPlatformRestaurants() {
  return restaurants;
}

export function listPlatformCrmTasks() {
  return crmTasks;
}

export function listPlatformCrmNotes() {
  return crmNotes;
}

export function listPlatformMembershipPlans() {
  return partnerMembershipPlans;
}

export function getSelectedPartnerProfile() {
  return partnerProfile;
}
