import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type SupabaseDatabaseClient = SupabaseClient<Database>;

function getSafeDataMode() {
  const mode = process.env.NEXT_PUBLIC_DATA_MODE;
  return mode === "supabase" || mode === "mock" ? mode : "unknown";
}

function getValidatedSupabaseUrl() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!value) return null;

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export function isSupabaseServerConfigured() {
  return Boolean(getValidatedSupabaseUrl() && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function isSupabaseServiceRoleConfigured() {
  return Boolean(getValidatedSupabaseUrl() && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function createSupabaseServerClient(): SupabaseClient<Database> | null {
  console.info("[prod-auth-debug] supabase:create-server-client:start");
  const supabaseUrl = getValidatedSupabaseUrl();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  console.info("[prod-auth-debug] supabase:env-state", {
    dataMode: getSafeDataMode(),
    supabaseUrl: supabaseUrl ? "present_valid" : "missing_or_invalid",
    anonKey: anonKey ? "present" : "missing",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "present" : "missing"
  });
  if (!supabaseUrl || !anonKey) {
    console.warn("[prod-auth-debug] supabase:create-server-client:missing-config");
    return null;
  }

  try {
    const client = createClient<Database>(
      supabaseUrl,
      anonKey,
      {
        auth: {
          persistSession: false
        }
      }
    );
    console.info("[prod-auth-debug] supabase:create-server-client:success");
    return client;
  } catch {
    console.error("[prod-auth-debug] supabase:create-server-client:failed");
    console.error("[supabase-server-client] Failed to initialize Supabase client.");
    return null;
  }
}

export function createSupabaseServiceRoleClient(): SupabaseClient<Database> | null {
  console.info("[prod-auth-debug] supabase:create-service-client:start");
  const supabaseUrl = getValidatedSupabaseUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  console.info("[prod-auth-debug] supabase:env-state", {
    dataMode: getSafeDataMode(),
    supabaseUrl: supabaseUrl ? "present_valid" : "missing_or_invalid",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "present" : "missing",
    serviceRoleKey: serviceRoleKey ? "present" : "missing"
  });
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn("[prod-auth-debug] supabase:create-service-client:missing-config");
    return null;
  }

  try {
    const client = createClient<Database>(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false
        }
      }
    );
    console.info("[prod-auth-debug] supabase:create-service-client:success");
    return client;
  } catch {
    console.error("[prod-auth-debug] supabase:create-service-client:failed");
    console.error("[supabase-service-role-client] Failed to initialize Supabase service client.");
    return null;
  }
}
