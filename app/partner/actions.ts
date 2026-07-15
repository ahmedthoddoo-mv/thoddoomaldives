"use server";

import { revalidatePath } from "next/cache";
import { getAuthorizedPartnerScope } from "@/lib/partner-portal/partnerAccess";
import { logPartnerAuditEvent } from "@/lib/partner-portal/partnerAuth";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type {
  PartnerPortalDocument,
  PartnerPortalGalleryItem,
  PartnerPortalProfileForm,
  PartnerPortalServiceItem
} from "@/lib/partner-portal/partnerAccess";
import type { BookingStatus } from "@/types/booking";

export type PartnerPortalActionResult = {
  ok: boolean;
  mode: "mock" | "supabase";
  message: string;
};

function sanitizeText(value: string, maxLength = 1200) {
  return value.replace(/[<>]/g, "").trim().slice(0, maxLength);
}

function parsePrice(value: string) {
  const parsed = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseCapacity(value: string) {
  const match = value.match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : 2;
}

function sanitizeFileName(value: string, fallback: string) {
  return (
    value
      .split("/")
      .filter(Boolean)
      .at(-1)
      ?.replace(/[^a-zA-Z0-9._-]/g, "-")
      .slice(0, 180) || fallback
  );
}

async function getScopedSupabase() {
  const scope = await getAuthorizedPartnerScope();
  if (scope.mode === "mock") {
    return { scope, supabase: null, mode: "mock" as const };
  }

  if (scope.mode !== "supabase") {
    return { scope, supabase: null, mode: "supabase" as const };
  }

  const supabase = createSupabaseServiceRoleClient();
  return { scope, supabase, mode: "supabase" as const };
}

function revalidatePartnerPortal() {
  revalidatePath("/partner");
  revalidatePath("/partner/dashboard");
  revalidatePath("/partner/profile");
  revalidatePath("/partner/rooms");
  revalidatePath("/partner/pricing");
  revalidatePath("/partner/gallery");
  revalidatePath("/partner/documents");
  revalidatePath("/partner/verification");
  revalidatePath("/stay");
  revalidatePath("/stay/thoddoo-sun-sky-inn");
}

export async function savePartnerBusinessProfile(profile: PartnerPortalProfileForm): Promise<PartnerPortalActionResult> {
  const { scope, supabase, mode } = await getScopedSupabase();
  if (mode === "mock") return { ok: true, mode, message: "Mock profile saved in local portal state." };
  if (!supabase || scope.mode !== "supabase") return { ok: false, mode, message: "Partner access is not available." };

  const payload = {
    name: sanitizeText(profile.businessName, 180),
    address: sanitizeText(profile.address, 300),
    google_maps_link: sanitizeText(profile.googleMaps, 700),
    whatsapp: sanitizeText(profile.whatsapp, 80),
    email: sanitizeText(profile.email, 180).toLowerCase(),
    website: sanitizeText(profile.website, 300),
    short_description: sanitizeText(profile.shortDescription, 1000),
    full_description: sanitizeText(profile.description, 4000),
    amenities: profile.amenities.map((item) => sanitizeText(item, 120)).filter(Boolean),
    policies: profile.policies.map((item) => sanitizeText(item, 240)).filter(Boolean),
    operating_hours: sanitizeText(profile.operatingHours, 300),
    languages: profile.languages.map((item) => sanitizeText(item, 80)).filter(Boolean),
    social_links: {
      instagram: sanitizeText(profile.instagram, 300),
      facebook: sanitizeText(profile.facebook, 300)
    },
    seo_title: sanitizeText(profile.seoTitle, 180),
    seo_description: sanitizeText(profile.seoDescription, 260)
  };

  const { error } = await (supabase as any)
    .from("properties")
    .update(payload)
    .eq("id", scope.propertyId)
    .eq("partner_id", scope.partnerId);

  if (error) return { ok: false, mode, message: error.message };

  await (supabase as any)
    .from("partners")
    .update({
      business_name: payload.name,
      whatsapp: payload.whatsapp,
      email: payload.email,
      website: payload.website,
      address: payload.address
    })
    .eq("id", scope.partnerId);

  await logPartnerAuditEvent("profile_update", { propertyId: scope.propertyId }, scope.partnerId);
  await logPartnerAuditEvent("property_update", { propertyId: scope.propertyId }, scope.partnerId);
  revalidatePartnerPortal();
  return { ok: true, mode, message: "Business profile saved to Supabase." };
}

export async function savePartnerServices(services: PartnerPortalServiceItem[]): Promise<PartnerPortalActionResult> {
  const { scope, supabase, mode } = await getScopedSupabase();
  if (mode === "mock") return { ok: true, mode, message: "Mock services saved in local portal state." };
  if (!supabase || scope.mode !== "supabase") return { ok: false, mode, message: "Partner access is not available." };

  const db = supabase as any;
  const serviceRows = services.map((service, index) => ({
    partner_id: scope.partnerId,
    property_id: scope.propertyId,
    service_type: "room",
    title: sanitizeText(service.title, 180),
    description: sanitizeText(service.description, 800),
    price: parsePrice(service.price),
    currency: service.currency,
    unit: service.unit,
    child_price: parsePrice(service.childPrice),
    notes: sanitizeText(service.notes, 800),
    active: service.active,
    sort_order: index,
    metadata: service.metadata
  }));

  await db.from("partner_service_items").delete().eq("partner_id", scope.partnerId).eq("property_id", scope.propertyId);
  if (serviceRows.length > 0) {
    const { error: serviceError } = await db.from("partner_service_items").insert(serviceRows);
    if (serviceError) return { ok: false, mode, message: serviceError.message };
  }

  await db.from("rooms").delete().eq("property_id", scope.propertyId);
  const roomRows = services.map((service) => ({
    property_id: scope.propertyId,
    name: sanitizeText(service.title, 180),
    bed_type: sanitizeText(service.metadata.bedType ?? "", 120) || null,
    capacity: sanitizeText(service.metadata.capacity ?? "2 guests", 80),
    adults: parseCapacity(service.metadata.adults ?? service.metadata.capacity ?? "2"),
    children: parseCapacity(service.metadata.children ?? "0"),
    price_per_night: parsePrice(service.price) ?? 0,
    breakfast_included: String(service.metadata.breakfast ?? service.notes).toLowerCase().includes("included"),
    description: sanitizeText(service.description, 800),
    active: service.active
  }));
  if (roomRows.length > 0) {
    const { error: roomError } = await db.from("rooms").insert(roomRows);
    if (roomError) return { ok: false, mode, message: roomError.message };
  }

  await logPartnerAuditEvent("price_update", { propertyId: scope.propertyId, itemCount: services.length }, scope.partnerId);
  revalidatePartnerPortal();
  return { ok: true, mode, message: "Rooms and pricing saved to Supabase." };
}

export async function savePartnerGallery(gallery: PartnerPortalGalleryItem[]): Promise<PartnerPortalActionResult> {
  const { scope, supabase, mode } = await getScopedSupabase();
  if (mode === "mock") return { ok: true, mode, message: "Mock gallery saved in local portal state." };
  if (!supabase || scope.mode !== "supabase") return { ok: false, mode, message: "Partner access is not available." };

  const db = supabase as any;
  const normalized = gallery.filter((item) => item.path.trim());
  const hero = normalized.find((item) => item.usage === "hero") ?? normalized[0];
  if (hero) {
    await db.from("properties").update({ hero_image_path: hero.path }).eq("id", scope.propertyId).eq("partner_id", scope.partnerId);
  }

  const mediaRows = normalized.map((item) => ({
    filename: item.path.split("/").filter(Boolean).at(-1) ?? "partner-media.jpg",
    path: sanitizeText(item.path, 700),
    category: item.usage === "hero" || item.usage === "cover" ? "Hero" : "Gallery",
    file_type: item.usage === "video" ? "video/mp4" : "image/jpeg",
    alt_text: sanitizeText(item.altText, 240),
    caption: sanitizeText(item.caption, 240),
    rights_status: "partner_submitted",
    archived: false
  }));

  const { data: mediaAssets, error: mediaError } = await db.from("media_assets").upsert(mediaRows, { onConflict: "path" }).select("id, path");
  if (mediaError) return { ok: false, mode, message: mediaError.message };

  await db.from("property_media").delete().eq("property_id", scope.propertyId);
  const links = (mediaAssets ?? []).map((asset: { id: string; path: string }) => {
    const item = normalized.find((entry) => entry.path === asset.path);
    return {
      property_id: scope.propertyId,
      media_asset_id: asset.id,
      usage: item?.usage === "hero" || item?.usage === "cover" ? "hero" : "gallery",
      sort_order: item?.sortOrder ?? normalized.findIndex((entry) => entry.path === asset.path)
    };
  });
  if (links.length > 0) {
    const { error: linkError } = await db.from("property_media").insert(links);
    if (linkError) return { ok: false, mode, message: linkError.message };
  }

  await logPartnerAuditEvent("gallery_update", { propertyId: scope.propertyId, itemCount: normalized.length }, scope.partnerId);
  revalidatePartnerPortal();
  return { ok: true, mode, message: "Gallery saved to Supabase." };
}

export async function savePartnerDocuments(documents: PartnerPortalDocument[]): Promise<PartnerPortalActionResult> {
  const { scope, supabase, mode } = await getScopedSupabase();
  if (mode === "mock") return { ok: true, mode, message: "Mock documents saved in local portal state." };
  if (!supabase || scope.mode !== "supabase") return { ok: false, mode, message: "Partner access is not available." };

  const rows = documents.map((document) => {
    const documentKey = sanitizeText(document.key, 120);
    const rawFileName = document.fileName || document.storagePath;
    const fileName = rawFileName ? sanitizeFileName(rawFileName, `${documentKey}.pdf`) : "";
    const hasDocument = Boolean(fileName);

    return {
      partner_id: scope.partnerId,
      property_id: scope.propertyId,
      document_key: documentKey,
      document_label: sanitizeText(document.label, 180),
      required: document.required,
      storage_bucket: "partner-documents",
      storage_path: hasDocument ? `partner-documents/${scope.partnerId}/${documentKey}/${fileName}` : null,
      file_name: fileName || null,
      status: hasDocument ? "uploaded" : "missing",
      expiry_date: document.expiryDate || null,
      uploaded_at: hasDocument ? new Date().toISOString() : null
    };
  });

  const { error } = await (supabase as any).from("partner_documents").upsert(rows, { onConflict: "partner_id,document_key" });
  if (error) return { ok: false, mode, message: error.message };

  await logPartnerAuditEvent("document_update", { documentCount: rows.length }, scope.partnerId);
  revalidatePartnerPortal();
  return { ok: true, mode, message: "Document center saved to Supabase." };
}

export async function updatePartnerBooking(params: {
  bookingId: string;
  status?: Extract<BookingStatus, "confirmed" | "rejected" | "completed" | "cancelled">;
  internalNotes?: string;
}) {
  const { scope, supabase, mode } = await getScopedSupabase();
  if (mode === "mock") return { ok: true, mode, message: "Mock booking updated." };
  if (!supabase || scope.mode !== "supabase") return { ok: false, mode, message: "Partner access is not available." };

  const payload: Record<string, string | null> = {};
  if (params.status) payload.booking_status = params.status;
  if (typeof params.internalNotes === "string") payload.internal_notes = sanitizeText(params.internalNotes, 1200) || null;
  if (Object.keys(payload).length === 0) return { ok: true, mode, message: "No booking changes to save." };

  const { error } = await (supabase as any)
    .from("bookings")
    .update(payload)
    .eq("id", params.bookingId)
    .eq("partner_id", scope.partnerId);
  if (error) return { ok: false, mode, message: error.message };

  await logPartnerAuditEvent("booking_update", { bookingId: params.bookingId, status: params.status ?? null }, scope.partnerId);
  revalidatePath("/partner/bookings");
  revalidatePath("/partner/dashboard");
  return { ok: true, mode, message: "Booking updated." };
}

export async function markPartnerNotificationRead(notificationId: string): Promise<PartnerPortalActionResult> {
  const { scope, supabase, mode } = await getScopedSupabase();
  if (mode === "mock") return { ok: true, mode, message: "Mock notification marked read." };
  if (!supabase || scope.mode !== "supabase") return { ok: false, mode, message: "Partner access is not available." };

  const { error } = await (supabase as any)
    .from("partner_notifications")
    .update({ status: "read", read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("partner_id", scope.partnerId);
  if (error) return { ok: false, mode, message: error.message };

  await logPartnerAuditEvent("notification_update", { notificationId }, scope.partnerId);
  revalidatePath("/partner/notifications");
  return { ok: true, mode, message: "Notification marked read." };
}
