import {
  BookingRepository,
  CRMRepository,
  ExperienceRepository,
  MediaRepository,
  PartnerRepository,
  PropertyRepository,
  RestaurantRepository,
  TransferRepository
} from "@/lib/repositories";
import {
  SupabaseBookingRepository,
  SupabaseCRMRepository,
  SupabaseExperienceRepository,
  SupabaseMediaRepository,
  SupabasePartnerRepository,
  SupabasePropertyRepository,
  SupabaseRestaurantRepository,
  SupabaseTransferRepository
} from "@/lib/repositories/supabase";
import { getDataMode } from "@/lib/supabase/status";

export function getRepositoryProvider() {
  const mode = getDataMode();

  if (mode === "supabase") {
    return {
      mode,
      properties: SupabasePropertyRepository,
      partners: SupabasePartnerRepository,
      bookings: SupabaseBookingRepository,
      media: SupabaseMediaRepository,
      restaurants: SupabaseRestaurantRepository,
      experiences: SupabaseExperienceRepository,
      transfers: SupabaseTransferRepository,
      crm: SupabaseCRMRepository
    };
  }

  return {
    mode,
    properties: PropertyRepository,
    partners: PartnerRepository,
    bookings: BookingRepository,
    media: MediaRepository,
    restaurants: RestaurantRepository,
    experiences: ExperienceRepository,
    transfers: TransferRepository,
    crm: CRMRepository
  };
}
