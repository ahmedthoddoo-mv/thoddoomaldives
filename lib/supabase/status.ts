import { isSupabaseServerConfigured, isSupabaseServiceRoleConfigured } from "@/lib/supabase/server";

export const SUPABASE_MIGRATION_VERSION = "202607110001";

export function getDataMode() {
  const requestedMode = process.env.NEXT_PUBLIC_DATA_MODE;

  if (requestedMode === "supabase" && isSupabaseServerConfigured()) {
    return "supabase";
  }

  return "mock";
}

export function getSupabaseStatus() {
  const configured = isSupabaseServerConfigured();

  return {
    dataMode: getDataMode(),
    supabaseConfigured: configured,
    serviceRoleConfigured: isSupabaseServiceRoleConfigured(),
    databaseReachable: configured ? "Not checked during build" : "Demo only",
    migrationVersion: SUPABASE_MIGRATION_VERSION
  };
}
