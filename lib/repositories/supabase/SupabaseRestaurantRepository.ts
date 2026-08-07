import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getPublicBusinessMediaMap } from "@/lib/business-media/server";
import { mapRestaurantRowToDomain } from "@/lib/supabase/mappers";

export const SupabaseRestaurantRepository = {
  async findAll() {
    const supabase = createSupabaseServiceRoleClient() ?? createSupabaseServerClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase.from("restaurants").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => mapRestaurantRowToDomain(row));
  },
  async findPublished() {
    const supabase = createSupabaseServerClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase.from("public_restaurants").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    const mediaMap = await getPublicBusinessMediaMap("restaurant", (data ?? []).map((row) => row.id));
    return (data ?? []).map((row) => mapRestaurantRowToDomain(row, mediaMap.get(row.id) ?? []));
  },
  async findPublishedBySlug(slug: string) {
    const supabase = createSupabaseServerClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase
      .from("public_restaurants")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return null;
    }
    const mediaMap = await getPublicBusinessMediaMap("restaurant", [data.id]);
    return mapRestaurantRowToDomain(data, mediaMap.get(data.id) ?? []);
  },
  async findById(id: string) {
    const rows = await this.findAll();
    return rows.find((row) => row.id === id);
  },
  async findBySlug(slug: string) {
    const rows = await this.findAll();
    return rows.find((row) => row.slug === slug);
  },
  async findFeatured() {
    const rows = await this.findAll();
    return rows.filter((row) => row.featured);
  },
  async findVerified() {
    return this.findFeatured();
  },
  async search(query: string) {
    const rows = await this.findAll();
    return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(query.toLowerCase()));
  }
};
