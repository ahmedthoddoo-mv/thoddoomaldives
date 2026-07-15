import { PropertyRepository, RestaurantRepository, ExperienceRepository, TransferRepository, BookingRepository } from "@/lib/repositories";
import { getRepositoryProvider } from "@/lib/repositories/provider";
import type { AdminManagedProperty } from "@/data/adminContent";
import type { Booking } from "@/types/booking";
import type { Experience } from "@/types/experience";
import type { Guesthouse } from "@/types/guesthouse";
import type { Restaurant } from "@/types/restaurant";
import type { Transfer } from "@/types/transfer";
import { adminPropertyToGuesthouse } from "@/lib/properties/propertyDomain";

export type LiveReadResult<T> = {
  data: T;
  source: "mock" | "supabase" | "fallback";
  error?: string;
};

function normalizeProviderMode(mode: string): "mock" | "supabase" {
  return mode === "mock" ? "mock" : "supabase";
}

async function safeRead<T>({
  read,
  fallback,
  source
}: {
  read: () => T | Promise<T>;
  fallback: () => T;
  source: "mock" | "supabase";
}): Promise<LiveReadResult<T>> {
  if (source === "mock") {
    return {
      data: fallback(),
      source
    };
  }

  try {
    return {
      data: await read(),
      source
    };
  } catch (error) {
    return {
      data: fallback(),
      source: "fallback",
      error: error instanceof Error ? error.message : "Supabase read failed. Showing mock data."
    };
  }
}

export async function getLiveAdminProperties(): Promise<LiveReadResult<AdminManagedProperty[]>> {
  const provider = getRepositoryProvider();
  const source = normalizeProviderMode(provider.mode);

  return safeRead({
    source,
    read: () => provider.properties.findAll(),
    fallback: () => PropertyRepository.findAll()
  });
}

export async function getLivePublishedGuesthouses(): Promise<LiveReadResult<Guesthouse[]>> {
  const provider = getRepositoryProvider();
  const source = normalizeProviderMode(provider.mode);

  return safeRead({
    source,
    read: async () => {
      const properties = await provider.properties.findPublished();
      return properties.map(adminPropertyToGuesthouse);
    },
    fallback: () => PropertyRepository.findPublicAll()
  });
}

export async function getLiveRestaurants(): Promise<LiveReadResult<Restaurant[]>> {
  const provider = getRepositoryProvider();
  const source = normalizeProviderMode(provider.mode);

  return safeRead({
    source,
    read: () => provider.restaurants.findAll(),
    fallback: () => RestaurantRepository.findAll()
  });
}

export async function getLiveExperiences(): Promise<LiveReadResult<Experience[]>> {
  const provider = getRepositoryProvider();
  const source = normalizeProviderMode(provider.mode);

  return safeRead({
    source,
    read: () => provider.experiences.findAll(),
    fallback: () => ExperienceRepository.findAll()
  });
}

export async function getLiveTransfers(): Promise<LiveReadResult<Transfer[]>> {
  const provider = getRepositoryProvider();
  const source = normalizeProviderMode(provider.mode);

  return safeRead({
    source,
    read: () => provider.transfers.findAll(),
    fallback: () => TransferRepository.findAll()
  });
}

export async function getLiveBookings(): Promise<LiveReadResult<Booking[]>> {
  const provider = getRepositoryProvider();
  const source = normalizeProviderMode(provider.mode);

  return safeRead({
    source,
    read: () => provider.bookings.findAll(),
    fallback: () => BookingRepository.findAll()
  });
}
