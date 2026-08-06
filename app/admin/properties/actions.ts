"use server";

import { revalidatePath } from "next/cache";
import type { AdminManagedProperty } from "@/data/adminContent";
import { revalidatePublicListingPaths } from "@/lib/cache/publicRoutes";
import { requireAdminSession } from "@/lib/admin/adminAuth";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

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

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseGpsLocation(value: string) {
  const [latitude, longitude] = value.split(",").map((part) => Number.parseFloat(part.trim()));
  return {
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null
  };
}

function parseRoomPrice(price: string) {
  const match = price.match(/[\d.]+/);
  const value = match ? Number.parseFloat(match[0]) : null;
  return value && value > 0 ? value : null;
}

function parseRoomAdults(capacity: string) {
  const match = capacity.match(/\d+/);
  return match ? Math.max(1, Number.parseInt(match[0], 10)) : 1;
}

function getFilename(path: string) {
  return path.split("/").filter(Boolean).at(-1) || "property-image.jpg";
}

export async function saveAdminPropertyToSupabase({
  property,
  publish = false
}: SaveAdminPropertyInput): Promise<SaveAdminPropertyResult> {
  const admin = await requireAdminSession();
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return { ok: false, message: "Supabase service role is not configured. Property was not saved." };
  }

  const isVerified = property.verificationStatus === "Verified";
  if ((publish || property.isPublished) && !isVerified) {
    return { ok: false, message: "Only verified businesses can be published." };
  }

  const { data: membershipPlan } = await supabase
    .from("membership_plans")
    .select("id")
    .eq("name", property.membershipPlan)
    .maybeSingle();
  const { latitude, longitude } = parseGpsLocation(property.gpsLocation);
  const propertyId = uuidPattern.test(property.id) ? property.id : null;
  const publicationStatus = property.isArchived
    ? "archived"
    : publish || property.isPublished
      ? "published"
      : "draft";

  const rooms = property.roomTypes.map((room) => ({
    name: room.name.trim(),
    bed_type: null,
    capacity: room.capacity.trim() || "Capacity on request",
    adults: parseRoomAdults(room.capacity),
    children: 0,
    price_per_night: parseRoomPrice(room.price),
    currency: room.price.toUpperCase().includes("MVR") ? "MVR" : "USD",
    breakfast_included: property.amenities.some((amenity) => amenity.toLowerCase().includes("breakfast")),
    description: room.price
  }));
  const uniqueImages = Array.from(new Set([property.coverImage, ...property.gallery].filter(Boolean)));
  const media = uniqueImages.map((path, index) => ({
    filename: getFilename(path),
    path,
    category: index === 0 ? "Hero" : "Gallery",
    media_type: index === 0 ? "hero" : "gallery",
    file_type: "image/jpeg",
    alt_text: `${property.name} image ${index + 1}`,
    caption: index === 0 ? `${property.name} hero image` : `${property.name} gallery image`,
    sort_order: index
  }));

  const { data, error } = await supabase.rpc("admin_save_property", {
    admin_user_id: admin.userId,
    property_uuid: propertyId,
    property_payload: {
      name: property.name.trim(),
      slug: property.slug.trim(),
      island: property.island,
      address: property.address,
      latitude,
      longitude,
      whatsapp: property.whatsapp,
      email: property.email,
      website: property.website,
      short_description: property.shortDescription,
      full_description: property.fullDescription || property.shortDescription,
      hero_image_path: property.coverImage,
      amenities: property.amenities,
      policies: property.policies,
      check_in_time: property.checkIn || null,
      check_out_time: property.checkOut || null,
      membership_plan_id: membershipPlan?.id ?? null,
      verification_status: property.verificationStatus.toLowerCase(),
      publication_status: publicationStatus,
      featured: property.isFeatured,
      seo_title: property.seo.title || `${property.name} | iThoddoo Maldives`,
      seo_description: property.seo.description || property.shortDescription
    },
    room_payload: rooms,
    media_payload: media
  });

  if (error || !data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, message: error?.message ?? "Property transaction returned no result." };
  }
  const result = data as { propertyId?: string; slug?: string };
  if (!result.propertyId || !result.slug) {
    return { ok: false, message: "Property transaction returned an invalid result." };
  }

  revalidatePath("/admin/properties");
  revalidatePath(`/admin/guesthouses/${result.propertyId}/edit`);
  revalidatePath(`/stay/${result.slug}`);
  revalidatePublicListingPaths();
  return {
    ok: true,
    message: publish ? `${property.name} saved and published.` : `${property.name} saved.`,
    propertyId: result.propertyId,
    slug: result.slug
  };
}
