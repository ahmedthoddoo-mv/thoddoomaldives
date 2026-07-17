import { isSupabaseServerConfigured, isSupabaseServiceRoleConfigured, logSupabaseEnvDiagnostics } from "@/lib/supabase/server";

export const SUPABASE_MIGRATION_VERSION = "202607110001";

export function getDataMode() {
  logSupabaseEnvDiagnostics("getDataMode");

  const requestedMode = process.env.DATA_MODE;

  if (requestedMode === "supabase") {
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
