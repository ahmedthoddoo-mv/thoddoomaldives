import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapTransferRowToDomain } from "@/lib/supabase/mappers";

export const SupabaseTransferRepository = {
  async findAll() {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];
    const { data, error } = await supabase.from("transfers").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapTransferRowToDomain);
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
