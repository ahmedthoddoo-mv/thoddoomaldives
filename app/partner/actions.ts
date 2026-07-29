"use server";
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
import type { Database } from "@/lib/supabase/types";

export type PartnerPortalActionResult = {
  ok: boolean;
  mode: "supabase";
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
  if (scope.mode !== "supabase") {
    return { scope, supabase: null, mode: "supabase" as const };
  }

  const supabase = createSupabaseServiceRoleClient();
  return { scope, supabase, mode: "supabase" as const };
}

export async function savePartnerBusinessProfile(profile: PartnerPortalProfileForm): Promise<PartnerPortalActionResult> {
  const { scope, supabase, mode } = await getScopedSupabase();
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

  const { error } = await supabase
    .from("properties")
    .update(payload)
    .eq("id", scope.propertyId)
    .eq("partner_id", scope.partnerId);

  if (error) return { ok: false, mode, message: error.message };

  await supabase
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
  return { ok: true, mode, message: "Business profile saved to Supabase." };
}

export async function savePartnerServices(services: PartnerPortalServiceItem[]): Promise<PartnerPortalActionResult> {
  const { scope, supabase, mode } = await getScopedSupabase();
  if (!supabase || scope.mode !== "supabase") return { ok: false, mode, message: "Partner access is not available." };

  const items = services.map((service, index) => ({
    title: sanitizeText(service.title, 180),
    description: sanitizeText(service.description, 800),
    price: parsePrice(service.price),
    currency: service.currency,
    unit: service.unit,
    child_price: parsePrice(service.childPrice),
    notes: sanitizeText(service.notes, 800),
    active: service.active,
    sort_order: index,
    bed_type: sanitizeText(service.metadata.bedType ?? "", 120) || null,
    capacity: sanitizeText(service.metadata.capacity ?? "2 guests", 80),
    adults: parseCapacity(service.metadata.adults ?? service.metadata.capacity ?? "2"),
    children: parseCapacity(service.metadata.children ?? "0"),
    breakfast_included: String(service.metadata.breakfast ?? service.notes).toLowerCase().includes("included"),
    metadata: service.metadata
  }));
  const { error } = await supabase.rpc("partner_replace_rooms_services", {
    actor_user_id: scope.authUserId,
    partner_uuid: scope.partnerId,
    property_uuid: scope.propertyId,
    items
  });
  if (error) return { ok: false, mode, message: error.message };

  await logPartnerAuditEvent("price_update", { propertyId: scope.propertyId, itemCount: services.length }, scope.partnerId);
  return { ok: true, mode, message: "Rooms and pricing saved to Supabase." };
}

export async function savePartnerGallery(gallery: PartnerPortalGalleryItem[]): Promise<PartnerPortalActionResult> {
  const { scope, supabase, mode } = await getScopedSupabase();
  if (!supabase || scope.mode !== "supabase") return { ok: false, mode, message: "Partner access is not available." };

  const normalized = gallery.filter((item) => item.path.trim());
  const items = normalized.map((item) => ({
    filename: item.path.split("/").filter(Boolean).at(-1) ?? "partner-media.jpg",
    path: sanitizeText(item.path, 700),
    usage: item.usage,
    alt_text: sanitizeText(item.altText, 240),
    caption: sanitizeText(item.caption, 240),
    sort_order: item.sortOrder
  }));
  const { error } = await supabase.rpc("partner_replace_gallery", {
    actor_user_id: scope.authUserId,
    partner_uuid: scope.partnerId,
    property_uuid: scope.propertyId,
    items
  });
  if (error) return { ok: false, mode, message: error.message };

  await logPartnerAuditEvent("gallery_update", { propertyId: scope.propertyId, itemCount: normalized.length }, scope.partnerId);
  return { ok: true, mode, message: "Gallery saved to Supabase." };
}

export async function savePartnerDocuments(documents: PartnerPortalDocument[]): Promise<PartnerPortalActionResult> {
  const { scope, supabase, mode } = await getScopedSupabase();
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

  const { error } = await supabase.from("partner_documents").upsert(rows, { onConflict: "partner_id,document_key" });
  if (error) return { ok: false, mode, message: error.message };

  await logPartnerAuditEvent("document_update", { documentCount: rows.length }, scope.partnerId);
  return { ok: true, mode, message: "Document center saved to Supabase." };
}

export async function updatePartnerBooking(params: {
  bookingId: string;
  status?: Extract<BookingStatus, "confirmed" | "rejected" | "completed" | "cancelled">;
}) {
  const { scope, supabase, mode } = await getScopedSupabase();
  if (!supabase || scope.mode !== "supabase") return { ok: false, mode, message: "Partner access is not available." };

  const allowedStatuses = new Set(["confirmed", "rejected", "completed", "cancelled"]);
  if (params.status && !allowedStatuses.has(params.status)) {
    return { ok: false, mode, message: "That booking transition is not available to partners." };
  }

  const payload: Database["public"]["Tables"]["bookings"]["Update"] = {};
  if (params.status) payload.booking_status = params.status;
  if (Object.keys(payload).length === 0) return { ok: true, mode, message: "No booking changes to save." };

  const allowedCurrentStatuses: Record<string, string[]> = {
    confirmed: ["new", "pending"],
    rejected: ["new", "pending"],
    completed: ["confirmed"],
    cancelled: ["new", "pending", "confirmed"]
  };
  const { data: updatedBooking, error } = await supabase
    .from("bookings")
    .update(payload)
    .eq("id", params.bookingId)
    .eq("partner_id", scope.partnerId)
    .in("booking_status", allowedCurrentStatuses[params.status ?? ""] ?? [])
    .select("id")
    .maybeSingle();
  if (error || !updatedBooking) {
    return { ok: false, mode, message: error?.message ?? "Booking transition is not allowed." };
  }

  await logPartnerAuditEvent("booking_update", { bookingId: params.bookingId, status: params.status ?? null }, scope.partnerId);
  return { ok: true, mode, message: "Booking updated." };
}

export async function markPartnerNotificationRead(notificationId: string): Promise<PartnerPortalActionResult> {
  const { scope, supabase, mode } = await getScopedSupabase();
  if (!supabase || scope.mode !== "supabase") return { ok: false, mode, message: "Partner access is not available." };

  const { error } = await supabase
    .from("partner_notifications")
    .update({ status: "read", read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("partner_id", scope.partnerId);
  if (error) return { ok: false, mode, message: error.message };

  await logPartnerAuditEvent("notification_update", { notificationId }, scope.partnerId);
  return { ok: true, mode, message: "Notification marked read." };
}
