import { partnerMembershipPlans, partnerProfile, partnerRooms } from "@/data/partnerPortal";
import {
  BookingRepository,
  CRMRepository,
  ExperienceRepository,
  MediaRepository,
  PropertyRepository,
  RestaurantRepository,
  TransferRepository
} from "@/lib/repositories";

export function listPlatformPartners() {
  return CRMRepository.findAll();
}

export function listPlatformProperties() {
  return PropertyRepository.findAll();
}

export function listPublicGuesthouses() {
  return PropertyRepository.findPublicAll();
}

export function listPlatformRooms() {
  return partnerRooms;
}

export function listPlatformBookings() {
  return BookingRepository.findAll();
}

export function listPlatformMediaAssets() {
  return MediaRepository.findAll();
}

export function listPlatformExperiences() {
  return ExperienceRepository.findAll();
}

export function listPlatformTransfers() {
  return TransferRepository.findAll();
}

export function listPlatformRestaurants() {
  return RestaurantRepository.findAll();
}

export function listPlatformCrmTasks() {
  return CRMRepository.findTasks();
}

export function listPlatformCrmNotes() {
  return CRMRepository.findNotes();
}

export function listPlatformMembershipPlans() {
  return partnerMembershipPlans;
}

export function getSelectedPartnerProfile() {
  return partnerProfile;
}
