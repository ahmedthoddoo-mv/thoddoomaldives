import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapPartnerRowToDomain } from "@/lib/supabase/mappers";

export const SupabasePartnerRepository = {
  async findAll() {
    const supabase = createSupabaseServerClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase.from("partners").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapPartnerRowToDomain);
  },
  async findById(id: string) {
    const supabase = createSupabaseServerClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase.from("partners").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapPartnerRowToDomain(data) : undefined;
  },
  async findBySlug(slug: string) {
    const supabase = createSupabaseServerClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase.from("partners").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    return data ? mapPartnerRowToDomain(data) : undefined;
  },
  async findFeatured() {
    const partners = await this.findAll();
    return partners.filter((partner) => partner.priority === "High" || partner.priority === "Urgent");
  },
  async findVerified() {
    const partners = await this.findAll();
    return partners.filter((partner) => partner.verification === "Verified");
  },
  async search(query: string) {
    const supabase = createSupabaseServerClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase.from("partners").select("*").or(`business_name.ilike.%${query}%,slug.ilike.%${query}%,category.ilike.%${query}%`);
    if (error) throw error;
    return (data ?? []).map(mapPartnerRowToDomain);
  }
};
