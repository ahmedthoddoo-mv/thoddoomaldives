"use server";

import { revalidatePath } from "next/cache";
import type { AdminManagedProperty } from "@/data/adminContent";
import { hasAdminDemoSession } from "@/lib/admin/adminAuth";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type SaveAdminPropertyInput = {
  property: AdminManagedProperty;
  publish?: boolean;
};

type SaveAdminPropertyResult = {
  ok: boolean;
  message: string;
  propertyId?: string;
  slug?: string;
};

type PropertyInsert = Database["public"]["Tables"]["properties"]["Insert"];
type RoomInsert = Database["public"]["Tables"]["rooms"]["Insert"];
type MediaInsert = Database["public"]["Tables"]["media_assets"]["Insert"];
type PropertyMediaInsert = Database["public"]["Tables"]["property_media"]["Insert"];

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseGpsLocation(value: string) {
  const [latitude, longitude] = value
    .split(",")
    .map((part) => Number.parseFloat(part.trim()))
    .filter((part) => Number.isFinite(part));

  return {
    latitude: typeof latitude === "number" ? latitude : null,
    longitude: typeof longitude === "number" ? longitude : null
  };
}

function parseRoomPrice(price: string) {
  const match = price.match(/[\d.]+/);
  return match ? Number.parseFloat(match[0]) : 0;
}

function parseRoomAdults(capacity: string) {
  const match = capacity.match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : 1;
}

function getFilename(path: string) {
  return path.split("/").filter(Boolean).at(-1) || "property-image.jpg";
}

function getPublicationStatus(property: AdminManagedProperty, publish?: boolean) {
  if (property.isArchived) {
    return "archived";
  }

  return publish || property.isPublished ? "published" : "draft";
}

function getVerificationStatus(property: AdminManagedProperty) {
  return property.verificationStatus.toLowerCase();
}

async function findMembershipPlanId(name: AdminManagedProperty["membershipPlan"]) {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return null;
  }

  const { data: rawData } = await supabase.from("membership_plans").select("id").eq("name", name).maybeSingle();
  const data = rawData as { id: string } | null;
  return data?.id ?? null;
}

export async function saveAdminPropertyToSupabase({
  property,
  publish = false
}: SaveAdminPropertyInput): Promise<SaveAdminPropertyResult> {
  const hasAccess = await hasAdminDemoSession();
  if (!hasAccess) {
    return {
      ok: false,
      message: "Admin demo session is required before saving to Supabase."
    };
  }

  const supabase = createSupabaseServiceRoleClient();

  // Temporary admin demo protection only. Replace with real authentication before production.
  if (!supabase) {
    return {
      ok: false,
      message: "Supabase service role is not configured. Property was not saved to the database."
    };
  }

  const db = supabase as any;
  const { latitude, longitude } = parseGpsLocation(property.gpsLocation);
  const membershipPlanId = await findMembershipPlanId(property.membershipPlan);
  const propertyIdIsUuid = uuidPattern.test(property.id);

  const { data: rawExistingProperty } = await db
    .from("properties")
    .select("id, partner_id")
    .eq(propertyIdIsUuid ? "id" : "slug", propertyIdIsUuid ? property.id : property.slug)
    .maybeSingle();
  const existingProperty = rawExistingProperty as { id: string; partner_id: string | null } | null;

  const { data: rawMatchingPartner } = await db
    .from("partners")
    .select("id")
    .eq("slug", property.slug)
    .maybeSingle();
  const matchingPartner = rawMatchingPartner as { id: string } | null;

  const propertyPayload: PropertyInsert = {
    ...(propertyIdIsUuid ? { id: property.id } : {}),
    partner_id: existingProperty?.partner_id ?? matchingPartner?.id ?? null,
    name: property.name,
    slug: property.slug,
    island: property.island,
    address: property.address || null,
    latitude,
    longitude,
    whatsapp: property.whatsapp || null,
    email: property.email || null,
    website: property.website || null,
    short_description: property.shortDescription,
    full_description: property.fullDescription || property.shortDescription,
    hero_image_path: property.coverImage,
    amenities: property.amenities,
    policies: property.policies,
    check_in_time: property.checkIn || null,
    check_out_time: property.checkOut || null,
    membership_plan_id: membershipPlanId,
    verification_status: publish ? "verified" : getVerificationStatus(property),
    publication_status: getPublicationStatus(property, publish),
    featured: property.isFeatured,
    seo_title: property.seo.title || `${property.name} | iThoddoo Maldives`,
    seo_description: property.seo.description || property.shortDescription
  };

  const { data: savedProperty, error: propertyError } = await db
    .from("properties")
    .upsert(propertyPayload, { onConflict: "slug" })
    .select("id, slug")
    .single();

  if (propertyError || !savedProperty) {
    return {
      ok: false,
      message: propertyError?.message ?? "Supabase did not return the saved property."
    };
  }

  const { error: roomDeleteError } = await db.from("rooms").delete().eq("property_id", savedProperty.id);
  if (roomDeleteError) {
    return { ok: false, message: roomDeleteError.message };
  }

  const roomRows: RoomInsert[] = property.roomTypes.map((room) => ({
    property_id: savedProperty.id,
    name: room.name,
    bed_type: null,
    capacity: room.capacity,
    adults: parseRoomAdults(room.capacity),
    children: 0,
    price_per_night: parseRoomPrice(room.price),
    breakfast_included: property.amenities.some((amenity) => amenity.toLowerCase().includes("breakfast")),
    description: room.price,
    active: true
  }));

  if (roomRows.length > 0) {
    const { error: roomInsertError } = await db.from("rooms").insert(roomRows);
    if (roomInsertError) {
      return { ok: false, message: roomInsertError.message };
    }
  }

  const uniqueImages = Array.from(new Set([property.coverImage, ...property.gallery].filter(Boolean)));
  const mediaRows: MediaInsert[] = uniqueImages.map((path, index) => ({
    filename: getFilename(path),
    path,
    category: index === 0 ? "Hero" : "Gallery",
    file_type: "image/jpeg",
    alt_text: `${property.name} image ${index + 1}`,
    caption: index === 0 ? `${property.name} hero image` : `${property.name} gallery image`,
    rights_status: "internal_demo_asset",
    archived: false
  }));

  if (mediaRows.length > 0) {
    const { data: mediaAssets, error: mediaError } = await db
      .from("media_assets")
      .upsert(mediaRows, { onConflict: "path" })
      .select("id, path");

    if (mediaError || !mediaAssets) {
      return { ok: false, message: mediaError?.message ?? "Supabase did not return media assets." };
    }

    const { error: mediaDeleteError } = await db.from("property_media").delete().eq("property_id", savedProperty.id);
    if (mediaDeleteError) {
      return { ok: false, message: mediaDeleteError.message };
    }

    const typedMediaAssets = mediaAssets as { id: string; path: string }[];
    const propertyMediaRows: PropertyMediaInsert[] = typedMediaAssets.map((asset) => ({
      property_id: savedProperty.id,
      media_asset_id: asset.id,
      usage: asset.path === property.coverImage ? "hero" : "gallery",
      sort_order: uniqueImages.indexOf(asset.path) + 1
    }));

    const { error: mediaLinkError } = await db.from("property_media").insert(propertyMediaRows);
    if (mediaLinkError) {
      return { ok: false, message: mediaLinkError.message };
    }
  }

  revalidatePath("/admin/properties");
  revalidatePath(`/admin/properties/${savedProperty.id}/edit`);
  revalidatePath("/stay");
  revalidatePath(`/stay/${savedProperty.slug}`);

  return {
    ok: true,
    message: publish
      ? `${property.name} saved to Supabase and published.`
      : `${property.name} saved to Supabase.`,
    propertyId: savedProperty.id,
    slug: savedProperty.slug
  };
}
