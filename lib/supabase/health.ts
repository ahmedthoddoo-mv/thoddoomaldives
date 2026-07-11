import "server-only";

import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
  isSupabaseServerConfigured,
  isSupabaseServiceRoleConfigured
} from "@/lib/supabase/server";
import { getDataMode, SUPABASE_MIGRATION_VERSION } from "@/lib/supabase/status";

const expectedTables = [
  "partners",
  "properties",
  "rooms",
  "bookings",
  "guests",
  "media_assets",
  "restaurants",
  "experiences",
  "transfers",
  "crm_tasks",
  "crm_notes",
  "membership_plans"
] as const;

export type SupabaseHealthCheck = {
  configured: boolean;
  reachable: boolean;
  dataMode: "mock" | "supabase";
  migrationVersion: string;
  checkedTables: Array<{
    table: string;
    accessible: boolean;
  }>;
  message: string;
};

export async function getSupabaseHealthCheck(): Promise<SupabaseHealthCheck> {
  const configured = isSupabaseServerConfigured();
  const dataMode = getDataMode();

  if (!configured) {
    return {
      configured,
      reachable: false,
      dataMode,
      migrationVersion: SUPABASE_MIGRATION_VERSION,
      checkedTables: expectedTables.map((table) => ({ table, accessible: false })),
      message: "Supabase environment variables are not configured. Mock mode remains active."
    };
  }

  const supabase = isSupabaseServiceRoleConfigured() ? createSupabaseServiceRoleClient() : createSupabaseServerClient();

  if (!supabase) {
    return {
      configured,
      reachable: false,
      dataMode,
      migrationVersion: SUPABASE_MIGRATION_VERSION,
      checkedTables: expectedTables.map((table) => ({ table, accessible: false })),
      message: "Supabase client could not be created."
    };
  }

  const checkedTables = await Promise.all(
    expectedTables.map(async (table) => {
      const { error } = await supabase.from(table).select("id", { count: "exact", head: true });

      return {
        table,
        accessible: !error
      };
    })
  );
  const reachable = checkedTables.some((table) => table.accessible);
  const missingTables = checkedTables.filter((table) => !table.accessible);

  return {
    configured,
    reachable,
    dataMode,
    migrationVersion: SUPABASE_MIGRATION_VERSION,
    checkedTables,
    message:
      missingTables.length === 0
        ? "Supabase is reachable and expected tables are accessible through current RLS."
        : `${missingTables.length} expected tables were not accessible. Check migrations and RLS policies.`
  };
}
