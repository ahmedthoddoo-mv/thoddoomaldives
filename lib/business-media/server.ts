import "server-only";

import { revalidatePath } from "next/cache";
import { revalidatePublicListingPaths } from "@/lib/cache/publicRoutes";
import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";
import type { BusinessMediaItem, BusinessMediaType } from "@/types/business-media";

type ServiceRoleClient = NonNullable<ReturnType<typeof createSupabaseServiceRoleClient>>;

type BusinessMediaContext = {
  businessType: BusinessMediaType;
  businessId: string;
  businessName: string;
  slug: string;
  partnerId: string | null;
  applicationId: string | null;
  primaryImagePath: string;
};

type RawManagedBusinessMediaRow = {
  id: string;
  business_type: BusinessMediaType;
  business_id: string;
  media_asset_id: string;
  caption: string | null;
  alt_text: string | null;
  sort_order: number;
  is_cover: boolean;
  is_featured: boolean;
  is_public: boolean;
  media_assets: Pick<
    Tables<"media_assets">,
    "id" | "filename" | "path" | "file_type" | "width" | "height" | "storage_bucket" | "storage_path"
  > | null;
};

type RawPublicBusinessMediaRow = {
  id: string;
  business_type: BusinessMediaType;
  business_id: string;
  media_asset_id: string;
  caption: string | null;
  alt_text: string | null;
  sort_order: number;
  is_cover: boolean;
  is_featured: boolean;
  path: string;
  filename: string;
  file_type: string;
  width: number | null;
  height: number | null;
  storage_bucket: string | null;
  storage_path: string | null;
};

function guessMimeType(path: string) {
  const lowerPath = path.toLowerCase();
  if (lowerPath.endsWith(".png")) return "image/png";
  if (lowerPath.endsWith(".webp")) return "image/webp";
  if (lowerPath.endsWith(".avif")) return "image/avif";
  if (lowerPath.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

function getFilename(path: string) {
  return path.split("/").filter(Boolean).at(-1) ?? "business-media-image";
}

function toBusinessMediaItem(row: RawManagedBusinessMediaRow): BusinessMediaItem | null {
  if (!row.media_assets?.path) {
    return null;
  }

  return {
    id: row.id,
    businessType: row.business_type,
    businessId: row.business_id,
    mediaAssetId: row.media_asset_id,
    url: row.media_assets.path,
    fileName: row.media_assets.filename,
    mimeType: row.media_assets.file_type,
    width: row.media_assets.width,
    height: row.media_assets.height,
    storageBucket: row.media_assets.storage_bucket,
    storagePath: row.media_assets.storage_path,
    caption: row.caption ?? "",
    altText: row.alt_text ?? "",
    sortOrder: row.sort_order,
    isCover: row.is_cover,
    isFeatured: row.is_featured,
    isPublic: row.is_public,
    source: row.media_assets.storage_path ? "storage" : "legacy"
  };
}

function toPublicBusinessMediaItem(row: RawPublicBusinessMediaRow): BusinessMediaItem {
  return {
    id: row.id,
    businessType: row.business_type,
    businessId: row.business_id,
    mediaAssetId: row.media_asset_id,
    url: row.path,
    fileName: row.filename,
    mimeType: row.file_type,
    width: row.width,
    height: row.height,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    caption: row.caption ?? "",
    altText: row.alt_text ?? "",
    sortOrder: row.sort_order,
    isCover: row.is_cover,
    isFeatured: row.is_featured,
    isPublic: true,
    source: row.storage_path ? "storage" : "legacy"
  };
}

export async function readBusinessMediaContext(
  db: ServiceRoleClient,
  businessType: BusinessMediaType,
  businessId: string
): Promise<BusinessMediaContext> {
  if (businessType === "property") {
    const { data, error } = await db
      .from("properties")
      .select("id, name, slug, partner_id, application_id, hero_image_path")
      .eq("id", businessId)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Business was not found.");
    return {
      businessType,
      businessId: data.id,
      businessName: data.name,
      slug: data.slug,
      partnerId: data.partner_id,
      applicationId: data.application_id,
      primaryImagePath: data.hero_image_path
    };
  }

  if (businessType === "restaurant") {
    const { data, error } = await db
      .from("restaurants")
      .select("id, name, slug, partner_id, application_id, image_path")
      .eq("id", businessId)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Business was not found.");
    return {
      businessType,
      businessId: data.id,
      businessName: data.name,
      slug: data.slug,
      partnerId: data.partner_id,
      applicationId: data.application_id,
      primaryImagePath: data.image_path
    };
  }

  if (businessType === "experience") {
    const { data, error } = await db
      .from("experiences")
      .select("id, title, slug, partner_id, application_id, image_path")
      .eq("id", businessId)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Business was not found.");
    return {
      businessType,
      businessId: data.id,
      businessName: data.title,
      slug: data.slug,
      partnerId: data.partner_id,
      applicationId: data.application_id,
      primaryImagePath: data.image_path
    };
  }

  const { data, error } = await db
    .from("transfers")
    .select("id, title, slug, partner_id, application_id, image_path")
    .eq("id", businessId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Business was not found.");
  return {
    businessType,
    businessId: data.id,
    businessName: data.title,
    slug: data.slug,
    partnerId: data.partner_id,
    applicationId: data.application_id,
    primaryImagePath: data.image_path
  };
}

async function findExistingAssetByPath(db: ServiceRoleClient, path: string) {
  const { data, error } = await db
    .from("media_assets")
    .select("id")
    .eq("path", path)
    .order("created_at", { ascending: true })
    .limit(1);
  if (error) throw error;
  return data?.[0] ?? null;
}

async function createLegacyAsset(
  db: ServiceRoleClient,
  context: BusinessMediaContext,
  path: string,
  mediaType: "hero" | "gallery"
) {
  const existing = await findExistingAssetByPath(db, path);
  if (existing) {
    return existing.id;
  }

  const { data, error } = await db
    .from("media_assets")
    .insert({
      application_id: context.applicationId,
      partner_id: context.partnerId,
      property_id: context.businessType === "property" ? context.businessId : null,
      filename: getFilename(path),
      path,
      storage_bucket: null,
      storage_path: null,
      category: mediaType === "hero" ? "Hero" : "Gallery",
      media_type: mediaType,
      file_type: guessMimeType(path),
      alt_text: context.businessName,
      caption: mediaType === "hero" ? `${context.businessName} cover image` : `${context.businessName} gallery image`,
      rights_status: "permission_confirmed",
      archived: false,
      sort_order: 0,
      visibility: "public"
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function seedPropertyMedia(db: ServiceRoleClient, context: BusinessMediaContext) {
  const { data, error } = await db
    .from("property_media")
    .select("usage, sort_order, media_assets(id, path, filename, file_type, width, height, storage_bucket, storage_path, alt_text, caption, visibility)")
    .eq("property_id", context.businessId)
    .order("sort_order", { ascending: true });
  if (error) throw error;

  const rows = (data ?? []) as unknown as Array<{
    usage: string;
    sort_order: number;
    media_assets: (Pick<
      Tables<"media_assets">,
      "id" | "path" | "filename" | "file_type" | "width" | "height" | "storage_bucket" | "storage_path" | "alt_text" | "caption" | "visibility"
    >) | null;
  }>;

  if (rows.length === 0) {
    if (!context.primaryImagePath) {
      return;
    }

    const mediaAssetId = await createLegacyAsset(db, context, context.primaryImagePath, "hero");
    const { error: insertError } = await db.from("business_media").insert({
      business_type: context.businessType,
      business_id: context.businessId,
      media_asset_id: mediaAssetId,
      partner_id: context.partnerId,
      application_id: context.applicationId,
      caption: `${context.businessName} cover image`,
      alt_text: context.businessName,
      sort_order: 0,
      is_cover: true,
      is_featured: false,
      is_public: true
    });
    if (insertError) throw insertError;
    return;
  }

  const coverIndex = rows.findIndex((row) => row.usage === "hero" || row.usage === "cover");
  const insertRows = rows
    .filter((row) => row.media_assets?.id && row.media_assets.path)
    .map((row, index) => ({
      business_type: context.businessType,
      business_id: context.businessId,
      media_asset_id: row.media_assets!.id,
      partner_id: context.partnerId,
      application_id: context.applicationId,
      caption: row.media_assets?.caption ?? "",
      alt_text: row.media_assets?.alt_text ?? context.businessName,
      sort_order: row.sort_order ?? index,
      is_cover: coverIndex >= 0 ? coverIndex === index : index === 0,
      is_featured: false,
      is_public: row.media_assets?.visibility !== "private"
    }));

  if (!insertRows.length) {
    return;
  }

  const { error: insertError } = await db.from("business_media").upsert(insertRows, {
    onConflict: "business_type,business_id,media_asset_id"
  });
  if (insertError) throw insertError;
}

async function seedSingleImageBusiness(db: ServiceRoleClient, context: BusinessMediaContext) {
  if (!context.primaryImagePath) {
    return;
  }

  const mediaAssetId = await createLegacyAsset(db, context, context.primaryImagePath, "hero");
  const { error } = await db.from("business_media").upsert({
    business_type: context.businessType,
    business_id: context.businessId,
    media_asset_id: mediaAssetId,
    partner_id: context.partnerId,
    application_id: context.applicationId,
    caption: `${context.businessName} cover image`,
    alt_text: context.businessName,
    sort_order: 0,
    is_cover: true,
    is_featured: false,
    is_public: true
  }, {
    onConflict: "business_type,business_id,media_asset_id"
  });
  if (error) throw error;
}

export async function ensureBusinessMediaSeeded(db: ServiceRoleClient, context: BusinessMediaContext) {
  const { count, error } = await db
    .from("business_media")
    .select("id", { count: "exact", head: true })
    .eq("business_type", context.businessType)
    .eq("business_id", context.businessId);
  if (error) throw error;
  if ((count ?? 0) > 0) {
    return;
  }

  if (context.businessType === "property") {
    await seedPropertyMedia(db, context);
    return;
  }

  await seedSingleImageBusiness(db, context);
}

async function readManagedBusinessMediaRows(db: ServiceRoleClient, context: BusinessMediaContext) {
  const { data, error } = await db
    .from("business_media")
    .select("id, business_type, business_id, media_asset_id, caption, alt_text, sort_order, is_cover, is_featured, is_public, media_assets(id, filename, path, file_type, width, height, storage_bucket, storage_path)")
    .eq("business_type", context.businessType)
    .eq("business_id", context.businessId)
    .order("is_cover", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as RawManagedBusinessMediaRow[];
}

export async function listManagedBusinessMedia(
  db: ServiceRoleClient,
  businessType: BusinessMediaType,
  businessId: string
) {
  const context = await readBusinessMediaContext(db, businessType, businessId);
  await ensureBusinessMediaSeeded(db, context);
  const rows = await readManagedBusinessMediaRows(db, context);
  return rows.map(toBusinessMediaItem).filter((item): item is BusinessMediaItem => Boolean(item));
}

export async function ensureBusinessMediaCover(db: ServiceRoleClient, context: BusinessMediaContext) {
  const rows = await readManagedBusinessMediaRows(db, context);
  if (rows.length === 0) {
    return;
  }

  if (rows.some((row) => row.is_cover)) {
    return;
  }

  const first = rows[0];
  const { error } = await db
    .from("business_media")
    .update({ is_cover: true })
    .eq("id", first.id);
  if (error) throw error;
}

export async function syncBusinessPrimaryImage(db: ServiceRoleClient, context: BusinessMediaContext) {
  const items = await listManagedBusinessMedia(db, context.businessType, context.businessId);
  const primaryUrl = items.find((item) => item.isCover)?.url ?? items[0]?.url ?? "";

  if (context.businessType === "property") {
    const { error } = await db
      .from("properties")
      .update({ hero_image_path: primaryUrl })
      .eq("id", context.businessId);
    if (error) throw error;
    return;
  }

  if (context.businessType === "restaurant") {
    const { error } = await db
      .from("restaurants")
      .update({ image_path: primaryUrl })
      .eq("id", context.businessId);
    if (error) throw error;
    return;
  }

  if (context.businessType === "experience") {
    const { error } = await db
      .from("experiences")
      .update({ image_path: primaryUrl })
      .eq("id", context.businessId);
    if (error) throw error;
    return;
  }

  const { error } = await db
    .from("transfers")
    .update({ image_path: primaryUrl })
    .eq("id", context.businessId);
  if (error) throw error;
}

export function revalidateBusinessMediaPaths(context: BusinessMediaContext) {
  revalidatePublicListingPaths();
  revalidatePath("/partner/gallery");

  if (context.businessType === "property") {
    revalidatePath("/admin/properties");
    revalidatePath(`/admin/properties/${context.businessId}/edit`);
    revalidatePath(`/admin/guesthouses/${context.businessId}/edit`);
    revalidatePath("/stay");
    revalidatePath(`/stay/${context.slug}`);
    return;
  }

  if (context.businessType === "restaurant") {
    revalidatePath("/admin/restaurants");
    revalidatePath(`/admin/restaurants/${context.businessId}/edit`);
    revalidatePath("/restaurants");
    return;
  }

  if (context.businessType === "experience") {
    revalidatePath("/admin/experiences");
    revalidatePath(`/admin/experiences/${context.businessId}/edit`);
    revalidatePath("/excursions");
    return;
  }

  revalidatePath("/admin/transfers");
  revalidatePath(`/admin/transfers/${context.businessId}/edit`);
  revalidatePath("/transfer");
  revalidatePath(`/transfer/${context.slug}`);
}

export async function getPublicBusinessMediaMap(businessType: BusinessMediaType, businessIds: string[]) {
  if (!businessIds.length) {
    return new Map<string, BusinessMediaItem[]>();
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return new Map<string, BusinessMediaItem[]>();
  }

  const { data, error } = await supabase
    .from("public_business_media")
    .select("*")
    .eq("business_type", businessType)
    .in("business_id", businessIds)
    .order("is_cover", { ascending: false })
    .order("sort_order", { ascending: true });
  if (error) throw error;

  const grouped = new Map<string, BusinessMediaItem[]>();
  for (const row of (data ?? []) as RawPublicBusinessMediaRow[]) {
    const current = grouped.get(row.business_id) ?? [];
    current.push(toPublicBusinessMediaItem(row));
    grouped.set(row.business_id, current);
  }
  return grouped;
}
