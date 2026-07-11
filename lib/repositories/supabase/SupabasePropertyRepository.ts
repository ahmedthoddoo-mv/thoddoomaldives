import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapPropertyRowToDomain } from "@/lib/supabase/mappers";
import type { Tables } from "@/lib/supabase/types";

type PropertyWithRooms = Tables<"properties"> & {
  rooms?: Tables<"rooms">[] | null;
};

export const SupabasePropertyRepository = {
  async findAll() {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];
    const { data } = await supabase.from("properties").select("*, rooms(*)").order("created_at", { ascending: false });
    return ((data ?? []) as PropertyWithRooms[]).map((property) => mapPropertyRowToDomain(property, property.rooms ?? []));
  },
  async findById(id: string) {
    const supabase = createSupabaseServerClient();
    if (!supabase) return undefined;
    const { data } = await supabase.from("properties").select("*, rooms(*)").eq("id", id).maybeSingle();
    const property = data as PropertyWithRooms | null;
    return property ? mapPropertyRowToDomain(property, property.rooms ?? []) : undefined;
  },
  async findBySlug(slug: string) {
    const supabase = createSupabaseServerClient();
    if (!supabase) return undefined;
    const { data } = await supabase.from("properties").select("*, rooms(*)").eq("slug", slug).maybeSingle();
    const property = data as PropertyWithRooms | null;
    return property ? mapPropertyRowToDomain(property, property.rooms ?? []) : undefined;
  },
  async findFeatured() {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];
    const { data } = await supabase.from("properties").select("*, rooms(*)").eq("featured", true).eq("publication_status", "published");
    return ((data ?? []) as PropertyWithRooms[]).map((property) => mapPropertyRowToDomain(property, property.rooms ?? []));
  },
  async findVerified() {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];
    const { data } = await supabase.from("properties").select("*, rooms(*)").eq("verification_status", "verified");
    return ((data ?? []) as PropertyWithRooms[]).map((property) => mapPropertyRowToDomain(property, property.rooms ?? []));
  },
  async findPublished() {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];
    const { data } = await supabase.from("properties").select("*, rooms(*)").eq("publication_status", "published");
    return ((data ?? []) as PropertyWithRooms[]).map((property) => mapPropertyRowToDomain(property, property.rooms ?? []));
  },
  async search(query: string) {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];
    const { data } = await supabase.from("properties").select("*, rooms(*)").or(`name.ilike.%${query}%,slug.ilike.%${query}%,island.ilike.%${query}%`);
    return ((data ?? []) as PropertyWithRooms[]).map((property) => mapPropertyRowToDomain(property, property.rooms ?? []));
  }
};
