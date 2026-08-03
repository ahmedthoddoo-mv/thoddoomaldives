import { getRepositoryProvider } from "@/lib/repositories/provider";
import type { AdminManagedProperty } from "@/data/adminContent";
import type { Booking } from "@/types/booking";
import type { Experience } from "@/types/experience";
import type { Guesthouse } from "@/types/guesthouse";
import type { Restaurant } from "@/types/restaurant";
import type { Transfer } from "@/types/transfer";
import { adminPropertyToGuesthouse } from "@/lib/properties/propertyDomain";
import { isSupabaseServerConfigured } from "@/lib/supabase/server";
import { SupabaseExperienceRepository, SupabaseRestaurantRepository, SupabaseTransferRepository } from "@/lib/repositories/supabase";
import type { CrmNote, CrmPartner, CrmTask } from "@/data/adminCrm";
import type { MediaAsset } from "@/data/adminCms";

export type LiveReadResult<T> = {
  data: T;
  source: "mock" | "supabase" | "supabase_error";
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
      data: await read(),
      source
    };
  }

  try {
    if (!isSupabaseServerConfigured()) {
      throw new Error("Supabase is not configured for this environment.");
    }
    return {
      data: await read(),
      source
    };
  } catch (error) {
    return {
      data: fallback(),
      source: "supabase_error",
      error: error instanceof Error ? error.message : "Supabase read failed."
    };
  }
}

export async function getLiveAdminProperties(): Promise<LiveReadResult<AdminManagedProperty[]>> {
  const provider = getRepositoryProvider();
  const source = normalizeProviderMode(provider.mode);

  return safeRead({
    source,
    read: () => provider.properties.findAll(),
    fallback: () => []
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
    fallback: () => []
  });
}

export async function getLiveRestaurants(): Promise<LiveReadResult<Restaurant[]>> {
  const provider = getRepositoryProvider();
  const source = normalizeProviderMode(provider.mode);

  return safeRead({
    source,
    read: () => provider.restaurants.findAll(),
    fallback: () => []
  });
}

export async function getLivePublishedRestaurants(): Promise<LiveReadResult<Restaurant[]>> {
  const provider = getRepositoryProvider();
  const source = normalizeProviderMode(provider.mode);
  return safeRead({ source, read: () => source === "mock" ? provider.restaurants.findAll() : SupabaseRestaurantRepository.findPublished(), fallback: () => [] });
}

export async function getLiveExperiences(): Promise<LiveReadResult<Experience[]>> {
  const provider = getRepositoryProvider();
  const source = normalizeProviderMode(provider.mode);

  return safeRead({
    source,
    read: () => provider.experiences.findAll(),
    fallback: () => []
  });
}

export async function getLivePublishedExperiences(): Promise<LiveReadResult<Experience[]>> {
  const provider = getRepositoryProvider();
  const source = normalizeProviderMode(provider.mode);
  return safeRead({ source, read: () => source === "mock" ? provider.experiences.findAll() : SupabaseExperienceRepository.findPublished(), fallback: () => [] });
}

export async function getLiveTransfers(): Promise<LiveReadResult<Transfer[]>> {
  const provider = getRepositoryProvider();
  const source = normalizeProviderMode(provider.mode);

  return safeRead({
    source,
    read: () => provider.transfers.findAll(),
    fallback: () => []
  });
}

export async function getLivePublishedTransfers(): Promise<LiveReadResult<Transfer[]>> {
  const provider = getRepositoryProvider();
  const source = normalizeProviderMode(provider.mode);
  return safeRead({ source, read: () => source === "mock" ? provider.transfers.findAll() : SupabaseTransferRepository.findPublished(), fallback: () => [] });
}

export async function getLiveBookings(): Promise<LiveReadResult<Booking[]>> {
  const provider = getRepositoryProvider();
  const source = normalizeProviderMode(provider.mode);

  return safeRead({
    source,
    read: () => provider.bookings.findAll(),
    fallback: () => []
  });
}

export async function getLiveCrm(): Promise<LiveReadResult<{
  partners: CrmPartner[];
  tasks: CrmTask[];
  notes: CrmNote[];
}>> {
  const provider = getRepositoryProvider();
  const source = normalizeProviderMode(provider.mode);

  return safeRead({
    source,
    read: async () => {
      const [partners, tasks, notes] = await Promise.all([
        provider.crm.findAll(),
        provider.crm.findTasks(),
        provider.crm.findNotes()
      ]);
      return { partners, tasks, notes } as { partners: CrmPartner[]; tasks: CrmTask[]; notes: CrmNote[] };
    },
    fallback: () => ({ partners: [], tasks: [], notes: [] })
  });
}

export async function getLiveMedia(): Promise<LiveReadResult<MediaAsset[]>> {
  const provider = getRepositoryProvider();
  const source = normalizeProviderMode(provider.mode);
  return safeRead({ source, read: () => provider.media.findAll(), fallback: () => [] });
}
