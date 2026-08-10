import "server-only";

import { readdirSync } from "node:fs";
import { join } from "node:path";
import { isSupabaseServerConfigured, isSupabaseServiceRoleConfigured } from "@/lib/supabase/server";

function readLatestMigrationVersion() {
  try {
    const migrationsPath = join(process.cwd(), "supabase", "migrations");
    const versions = readdirSync(migrationsPath)
      .map((file) => file.match(/^(\d+)_/)?.[1] ?? null)
      .filter((value): value is string => Boolean(value))
      .sort();
    return versions.at(-1) ?? "unknown";
  } catch {
    return "unknown";
  }
}

export const SUPABASE_MIGRATION_VERSION = readLatestMigrationVersion();

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
