import { adminPropertyToGuesthouse } from "@/lib/properties/propertyDomain";
import { SupabasePropertyRepository } from "@/lib/repositories/supabase";
import { getDataMode } from "@/lib/supabase/status";
import type { Guesthouse } from "@/types/guesthouse";

export type PropertyReadSource = "supabase" | "setup_required" | "unavailable";

export type PropertyReadResult<T> = {
  data: T;
  source: PropertyReadSource;
  error?: string;
};

export async function getPublishedStayProperties(): Promise<PropertyReadResult<Guesthouse[]>> {
  if (getDataMode() !== "supabase") {
    return {
      data: [],
      source: "setup_required"
    };
  }

  try {
    const properties = await SupabasePropertyRepository.findPublished();

    return {
      data: properties.map(adminPropertyToGuesthouse),
      source: "supabase"
    };
  } catch {
    return {
      data: [],
      source: "unavailable",
      error: "The live property directory is temporarily unavailable."
    };
  }
}

export async function getPublishedStayPropertyBySlug(slug: string): Promise<PropertyReadResult<Guesthouse | undefined>> {
  if (getDataMode() !== "supabase") {
    return {
      data: undefined,
      source: "setup_required"
    };
  }

  try {
    const property = await SupabasePropertyRepository.findBySlug(slug);

    if (!property || !property.isPublished || property.isArchived || property.verificationStatus !== "Verified") {
      return {
        data: undefined,
        source: "supabase"
      };
    }

    return {
      data: adminPropertyToGuesthouse(property),
      source: "supabase"
    };
  } catch {
    return {
      data: undefined,
      source: "unavailable",
      error: "The live property listing is temporarily unavailable."
    };
  }
}
