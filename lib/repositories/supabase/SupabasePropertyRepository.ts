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

async function readPublicProperties(options: { slug?: string; featured?: boolean } = {}) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];
  let query = supabase.from("public_properties").select("*");
  if (options.slug) query = query.eq("slug", options.slug);
  if (options.featured) query = query.eq("featured", true);
  const { data: properties, error } = await query
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!properties?.length) return [];

  const ids = properties.map((property) => property.id);
  const [roomResult, mediaResult, serviceResult] = await Promise.all([
    supabase.from("public_rooms").select("*").in("property_id", ids),
    supabase.from("public_property_media").select("*").in("property_id", ids).order("sort_order"),
    supabase.from("public_property_services").select("*").in("property_id", ids).order("sort_order")
  ]);
  if (roomResult.error) throw roomResult.error;
  if (mediaResult.error) throw mediaResult.error;
  if (serviceResult.error) throw serviceResult.error;

  return properties.map((property) => {
    const propertyRooms = (roomResult.data ?? []).filter((room) => room.property_id === property.id);
    const propertyMedia = (mediaResult.data ?? [])
      .filter((media) => media.property_id === property.id)
      .map((media) => ({
        property_id: property.id,
        media_asset_id: media.id,
        usage: media.media_type === "hero" || media.media_type === "cover" ? "hero" : "gallery",
        sort_order: media.sort_order,
        created_at: property.created_at,
        media_assets: {
          id: media.id,
          filename: media.path.split("/").at(-1) ?? "property-image",
          path: media.path,
          category: media.media_type ?? "gallery",
          file_type: "image/jpeg",
          width: media.width,
          height: media.height,
          alt_text: media.alt_text,
          caption: media.caption,
          rights_status: "permission_confirmed",
          archived: false,
          application_id: null,
          partner_id: null,
          property_id: property.id,
          room_id: media.room_id,
          storage_bucket: null,
          storage_path: null,
          media_type: media.media_type,
          sort_order: media.sort_order,
          visibility: "public",
          created_at: property.created_at,
          updated_at: property.updated_at
        }
      }));
    const mapped = mapPropertyRowToDomain(property as Tables<"properties">, {
      rooms: propertyRooms as Tables<"rooms">[],
      propertyMedia: propertyMedia as NonNullable<PropertyWithRooms["property_media"]>
    });
    mapped.services = (serviceResult.data ?? []).filter((service) => service.property_id === property.id).map((service) => ({
      id: service.id,
      name: service.title,
      description: service.description ?? "",
      price: service.price,
      currency: service.currency,
      unit: service.unit
    }));
    return mapped;
  });
}

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
    return ((data ?? []) as unknown as PropertyWithRooms[]).map(mapProperty);
  },
  async findById(id: string) {
    const supabase = createSupabaseServiceRoleClient() ?? createSupabaseServerClient();
    if (!supabase) return undefined;
    const { data, error } = await supabase.from("properties").select(propertySelect).eq("id", id).maybeSingle();
    if (error) throw error;
    const property = data as unknown as PropertyWithRooms | null;
    return property ? mapProperty(property) : undefined;
  },
  async findBySlug(slug: string) {
    return (await readPublicProperties({ slug }))[0];
  },
  async findFeatured() {
    return readPublicProperties({ featured: true });
  },
  async findVerified() {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];
    const { data, error } = await supabase.from("properties").select(propertySelect).eq("verification_status", "verified");
    if (error) throw error;
    return ((data ?? []) as unknown as PropertyWithRooms[]).map(mapProperty);
  },
  async findPublished() {
    return readPublicProperties();
  },
  async search(query: string) {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];
    const { data, error } = await supabase.from("properties").select(propertySelect).or(`name.ilike.%${query}%,slug.ilike.%${query}%,island.ilike.%${query}%`);
    if (error) throw error;
    return ((data ?? []) as unknown as PropertyWithRooms[]).map(mapProperty);
  }
};
