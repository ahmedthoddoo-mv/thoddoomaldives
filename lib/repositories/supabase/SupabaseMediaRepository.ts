import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { mapMediaRowToDomain } from "@/lib/supabase/mappers";
import type { MediaAsset } from "@/data/adminCms";
import type { Tables } from "@/lib/supabase/types";

type BusinessMediaRow = Pick<
  Tables<"business_media">,
  "id" | "media_asset_id" | "business_type" | "business_id" | "is_public" | "is_cover" | "is_featured" | "sort_order"
>;

function isMediaAsset(asset: MediaAsset | null): asset is MediaAsset {
  return asset !== null;
}

export const SupabaseMediaRepository = {
  async findAll() {
    const supabase = createSupabaseServiceRoleClient() ?? createSupabaseServerClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data: businessMedia, error: businessMediaError } = await supabase
      .from("business_media")
      .select("id, media_asset_id, business_type, business_id, is_public, is_cover, is_featured, sort_order")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (businessMediaError) throw businessMediaError;

    const mediaAssetIds = Array.from(new Set((businessMedia ?? []).map((row) => row.media_asset_id).filter(Boolean)));
    if (mediaAssetIds.length === 0) {
      return [];
    }

    const { data: mediaAssets, error: mediaAssetsError } = await supabase
      .from("media_assets")
      .select("*")
      .in("id", mediaAssetIds)
      .order("created_at", { ascending: false });
    if (mediaAssetsError) throw mediaAssetsError;

    const mediaAssetById = new Map((mediaAssets ?? []).map((asset) => [asset.id, asset] as const));
    return ((businessMedia ?? []) as BusinessMediaRow[])
      .map((row) => {
        const asset = mediaAssetById.get(row.media_asset_id);
        if (!asset) return null;
        return mapMediaRowToDomain(asset, { isPublic: row.is_public });
      })
      .filter(isMediaAsset);
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
