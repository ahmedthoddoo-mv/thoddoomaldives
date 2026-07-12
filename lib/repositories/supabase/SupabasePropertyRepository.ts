import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { mapPropertyRowToDomain } from "@/lib/supabase/mappers";
import type { Tables } from "@/lib/supabase/types";

type PropertyWithRooms = Tables<"properties"> & {
  rooms?: Tables<"rooms">[] | null;
  partners?: Tables<"partners"> | null;
  property_media?:
    | Array<
        Tables<"property_media"> & {
          media_assets?: Tables<"media_assets"> | null;
        }
      >
    | null;
};

const propertySelect = `
  *,
  partners(*),
  rooms(*),
  property_media(
    usage,
    sort_order,
    media_assets(*)
  )
`;

function mapProperty(property: PropertyWithRooms) {
  return mapPropertyRowToDomain(property, {
    rooms: property.rooms ?? [],
    partner: property.partners ?? undefined,
    propertyMedia: property.property_media ?? []
  });
}

export const SupabasePropertyRepository = {
  async findAll() {
    const supabase = createSupabaseServiceRoleClient() ?? createSupabaseServerClient();
    if (!supabase) return [];
    const { data, error } = await supabase.from("properties").select(propertySelect).order("created_at", { ascending: false });
    if (error) throw error;
    return ((data ?? []) as PropertyWithRooms[]).map(mapProperty);
  },
  async findById(id: string) {
    const supabase = createSupabaseServiceRoleClient() ?? createSupabaseServerClient();
    if (!supabase) return undefined;
    const { data, error } = await supabase.from("properties").select(propertySelect).eq("id", id).maybeSingle();
    if (error) throw error;
    const property = data as PropertyWithRooms | null;
    return property ? mapProperty(property) : undefined;
  },
  async findBySlug(slug: string) {
    const supabase = createSupabaseServerClient();
    if (!supabase) return undefined;
    const { data, error } = await supabase.from("properties").select(propertySelect).eq("slug", slug).maybeSingle();
    if (error) throw error;
    const property = data as PropertyWithRooms | null;
    return property ? mapProperty(property) : undefined;
  },
  async findFeatured() {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];
    const { data, error } = await supabase.from("properties").select(propertySelect).eq("featured", true).eq("publication_status", "published");
    if (error) throw error;
    return ((data ?? []) as PropertyWithRooms[]).map(mapProperty);
  },
  async findVerified() {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];
    const { data, error } = await supabase.from("properties").select(propertySelect).eq("verification_status", "verified");
    if (error) throw error;
    return ((data ?? []) as PropertyWithRooms[]).map(mapProperty);
  },
  async findPublished() {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("properties")
      .select(propertySelect)
      .eq("publication_status", "published")
      .neq("verification_status", "suspended")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ((data ?? []) as PropertyWithRooms[]).map(mapProperty);
  },
  async search(query: string) {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];
    const { data, error } = await supabase.from("properties").select(propertySelect).or(`name.ilike.%${query}%,slug.ilike.%${query}%,island.ilike.%${query}%`);
    if (error) throw error;
    return ((data ?? []) as PropertyWithRooms[]).map(mapProperty);
  }
};
