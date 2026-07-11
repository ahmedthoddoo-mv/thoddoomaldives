import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapRestaurantRowToDomain } from "@/lib/supabase/mappers";

export const SupabaseRestaurantRepository = {
  async findAll() {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];
    const { data } = await supabase.from("restaurants").select("*").order("created_at", { ascending: false });
    return (data ?? []).map(mapRestaurantRowToDomain);
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
