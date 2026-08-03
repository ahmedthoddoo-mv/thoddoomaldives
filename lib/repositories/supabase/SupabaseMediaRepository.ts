import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapMediaRowToDomain } from "@/lib/supabase/mappers";

export const SupabaseMediaRepository = {
  async findAll() {
    const supabase = createSupabaseServerClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase.from("media_assets").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapMediaRowToDomain);
  },
  async findById(id: string) {
    const assets = await this.findAll();
    return assets.find((asset) => asset.id === id);
  },
  async findBySlug(slug: string) {
    const assets = await this.findAll();
    return assets.find((asset) => asset.filename === slug || asset.path.endsWith(slug));
  },
  async findFeatured() {
    const assets = await this.findAll();
    return assets.filter((asset) => asset.isHero);
  },
  async findVerified() {
    const assets = await this.findAll();
    return assets.filter((asset) => asset.rightsStatus !== "Needs confirmation");
  },
  async search(query: string) {
    const assets = await this.findAll();
    return assets.filter((asset) => JSON.stringify(asset).toLowerCase().includes(query.toLowerCase()));
  }
};
