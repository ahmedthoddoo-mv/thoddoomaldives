import { adminPropertyToGuesthouse } from "@/lib/properties/propertyDomain";
import { PropertyRepository } from "@/lib/repositories";
import { SupabasePropertyRepository } from "@/lib/repositories/supabase";
import { getDataMode } from "@/lib/supabase/status";
import type { Guesthouse } from "@/types/guesthouse";

type PropertyReadResult<T> = {
  data: T;
  source: "mock" | "supabase" | "fallback";
  error?: string;
};

function publicMockProperties() {
  return PropertyRepository.findPublicAll();
}

export async function getPublishedStayProperties(): Promise<PropertyReadResult<Guesthouse[]>> {
  if (getDataMode() !== "supabase") {
    return {
      data: publicMockProperties(),
      source: "mock"
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
      data: publicMockProperties(),
      source: "fallback",
      error: "Supabase property read failed. Showing mock properties."
    };
  }
}

export async function getPublishedStayPropertyBySlug(slug: string): Promise<PropertyReadResult<Guesthouse | undefined>> {
  if (getDataMode() !== "supabase") {
    return {
      data: PropertyRepository.findPublicBySlug(slug),
      source: "mock"
    };
  }

  try {
    const property = await SupabasePropertyRepository.findBySlug(slug);

    if (!property || !property.isPublished || property.isArchived || property.verificationStatus === "Suspended") {
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
      data: PropertyRepository.findPublicBySlug(slug),
      source: "fallback",
      error: "Supabase property detail read failed. Showing mock property if available."
    };
  }
}
