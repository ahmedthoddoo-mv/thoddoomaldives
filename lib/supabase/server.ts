import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type SupabaseDatabaseClient = SupabaseClient<Database>;

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
  const supabaseUrl = getValidatedSupabaseUrl();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
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
    return client;
  } catch {
    console.error("[supabase-server-client] Failed to initialize Supabase client.");
    return null;
  }
}

export function createSupabaseServiceRoleClient(): SupabaseClient<Database> | null {
  const supabaseUrl = getValidatedSupabaseUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
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
    return client;
  } catch {
    console.error("[supabase-service-role-client] Failed to initialize Supabase service client.");
    return null;
  }
}
