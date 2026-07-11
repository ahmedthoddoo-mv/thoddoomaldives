import { SupabasePropertyRepository } from "@/lib/repositories/supabase";
import { getSupabaseStatus } from "@/lib/supabase/status";

export async function demoReadPublishedProperties() {
  const status = getSupabaseStatus();

  if (status.dataMode !== "supabase") {
    return {
      status,
      properties: [],
      message: "Mock mode is active. Supabase property reads are skipped."
    };
  }

  const properties = await SupabasePropertyRepository.findPublished();

  return {
    status,
    properties,
    message: `Read ${properties.length} published properties from Supabase.`
  };
}
