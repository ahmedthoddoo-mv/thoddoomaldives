import { isSupabaseServerConfigured, isSupabaseServiceRoleConfigured } from "@/lib/supabase/server";

export const SUPABASE_MIGRATION_VERSION = "202607110001";

export function getDataMode() {
  return process.env.NEXT_PUBLIC_DATA_MODE === "mock" ? "mock" : "supabase";
}

export function getSupabaseStatus() {
  const configured = isSupabaseServerConfigured();

  return {
    dataMode: getDataMode(),
    supabaseConfigured: configured,
    serviceRoleConfigured: isSupabaseServiceRoleConfigured(),
    databaseReachable: configured ? "Not checked during build" : "Unavailable",
    migrationVersion: SUPABASE_MIGRATION_VERSION
  };
}
