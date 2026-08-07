"use server";
import { getAuthorizedPartnerScope } from "@/lib/partner-portal/partnerAccess";
import { logPartnerAuditEvent } from "@/lib/partner-portal/partnerAuth";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type {
  PartnerPortalDocument,
  PartnerPortalProfileForm,
  PartnerPortalServiceItem
} from "@/lib/partner-portal/partnerAccess";
import type { BookingStatus } from "@/types/booking";
import type { Database } from "@/lib/supabase/types";
import type { Json } from "@/lib/supabase/types";
import type { AvailabilityProvider } from "@/types/availability";
import type { TransferSchedule } from "@/types/transfer-schedule";

export type PartnerPortalActionResult = {
  ok: boolean;
  mode: "supabase";
  message: string;
};

type LegacyPartnerGalleryItem = {
  id: string;
  path: string;
  caption: string;
  altText: string;
  usage: "logo" | "cover" | "hero" | "gallery" | "video";
  sortOrder: number;
};

type PartnerRestaurantMenuDefinition = Array<{
  name: string;
  items: Array<{
    name: string;
    description?: string;
    priceMvr?: number;
    available?: boolean;
    public?: boolean;
  }>;
}>;

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

export async function parsePartnerRestaurantMenuDefinition(value: unknown): Promise<PartnerRestaurantMenuDefinition> {
  if (typeof value !== "string") return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is { name: string; items?: Array<Record<string, unknown>> } => Boolean(entry) && typeof entry === "object" && typeof (entry as { name?: unknown }).name === "string")
      .map((entry) => ({
        name: entry.name.trim(),
        items: Array.isArray(entry.items)
          ? entry.items
              .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
              .map((item) => ({
                name: typeof item.name === "string" ? item.name.trim() : "",
                description: typeof item.description === "string" ? item.description : undefined,
                priceMvr: typeof item.priceMvr === "number" ? item.priceMvr : undefined,
                available: typeof item.available === "boolean" ? item.available : true,
                public: typeof item.public === "boolean" ? item.public : true
              }))
              .filter((item) => item.name)
          : []
      }))
      .filter((entry) => entry.name && entry.items.length > 0);
  } catch {
    return [];
  }
}

export async function savePartnerRestaurantMenuData(supabase: NonNullable<ReturnType<typeof createSupabaseServiceRoleClient>>, restaurantId: string, definition: PartnerRestaurantMenuDefinition) {
  if (!restaurantId) return;
  await supabase.from("restaurant_menu_categories" as any).delete().eq("restaurant_id", restaurantId); // eslint-disable-line @typescript-eslint/no-explicit-any
  await supabase.from("restaurant_menu_items" as any).delete().eq("restaurant_id", restaurantId); // eslint-disable-line @typescript-eslint/no-explicit-any

  for (const [categoryIndex, category] of definition.entries()) {
    const { data: categoryRow, error: categoryError } = await supabase
      .from("restaurant_menu_categories" as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .insert({ restaurant_id: restaurantId, name: category.name, slug: category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), sort_order: categoryIndex + 1, is_public: true })
      .select("id")
      .single();
    if (categoryError || !categoryRow || !("id" in categoryRow)) continue;

    const itemRows = category.items.map((item, itemIndex) => ({
      restaurant_id: restaurantId,
      category_id: (categoryRow as any).id, // eslint-disable-line @typescript-eslint/no-explicit-any
      name: item.name,
      description: item.description ?? null,
      price_mvr: item.priceMvr ?? null,
      sort_order: itemIndex + 1,
      is_available: item.available ?? true,
      is_public: item.public ?? true
    }));
    if (itemRows.length > 0) {
      await supabase.from("restaurant_menu_items" as any).insert(itemRows as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
  }
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

  const { data: currentProperty, error: currentPropertyError } = await supabase.from("properties").select("name").eq("id", scope.propertyId).eq("partner_id", scope.partnerId).maybeSingle();
  if (currentPropertyError || !currentProperty) return { ok: false, mode, message: currentPropertyError?.message ?? "Owned property was not found." };
  const requestedBusinessName = sanitizeText(profile.businessName, 180);
  const identityChangeRequested = requestedBusinessName !== currentProperty.name;
  if (identityChangeRequested) {
    const { error: requestError } = await supabase.from("partner_change_requests").insert({ partner_id: scope.partnerId, listing_type: "property", listing_id: scope.propertyId, change_type: "business_identity", requested_values: { name: requestedBusinessName }, requested_by: scope.authUserId });
    if (requestError) return { ok: false, mode, message: requestError.message };
  }
  const payload = {
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
      whatsapp: payload.whatsapp,
      email: payload.email,
      website: payload.website,
      address: payload.address
    })
    .eq("id", scope.partnerId);

  await logPartnerAuditEvent("profile_update", { propertyId: scope.propertyId }, scope.partnerId);
  await logPartnerAuditEvent("property_update", { propertyId: scope.propertyId }, scope.partnerId);
  return { ok: true, mode, message: identityChangeRequested ? "Operational profile saved. The business name change was sent for admin review." : "Business profile saved to Supabase." };
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

export async function savePartnerGallery(gallery: LegacyPartnerGalleryItem[]): Promise<PartnerPortalActionResult> {
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

export async function savePartnerTransferSchedule(schedule: TransferSchedule): Promise<PartnerPortalActionResult> {
  const { scope, supabase, mode } = await getScopedSupabase();
  if (!supabase || scope.mode !== "supabase" || scope.listingType !== "transfer") return { ok: false, mode, message: "Transfer owner access is required." };
  if (!schedule.daysOfWeek.length || !/^([01]\d|2[0-3]):[0-5]\d/.test(schedule.departureTime)) return { ok: false, mode, message: "Choose operating days and a valid departure time." };
  const payload = {
    direction: sanitizeText(schedule.direction, 160), departurePoint: sanitizeText(schedule.departurePoint, 180), arrivalPoint: sanitizeText(schedule.arrivalPoint, 180),
    daysOfWeek: schedule.daysOfWeek, departureTime: schedule.departureTime, effectiveStart: schedule.effectiveStart ?? "", effectiveEnd: schedule.effectiveEnd ?? "",
    fridaySpecific: schedule.fridaySpecific, price: schedule.price, currency: schedule.currency, unit: sanitizeText(schedule.unit, 80),
    vesselCapacity: schedule.vesselCapacity, vesselDetails: sanitizeText(schedule.vesselDetails ?? "", 500), luggagePolicy: sanitizeText(schedule.luggagePolicy ?? "", 800),
    pickupDropoff: sanitizeText(schedule.pickupDropoff ?? "", 800), cancellationNotice: sanitizeText(schedule.cancellationNotice ?? "", 800),
    weatherNotice: sanitizeText(schedule.weatherNotice ?? "", 800), active: schedule.active
  };
  const exceptions = schedule.exceptions.map((item) => ({ date: item.date, departureTime: item.departureTime ?? "", cancelled: item.cancelled, notice: sanitizeText(item.notice ?? "", 400) }));
  const { error } = await supabase.rpc("partner_save_transfer_schedule", { actor_user_id: scope.authUserId, partner_uuid: scope.partnerId, transfer_uuid: scope.listingId, schedule_uuid: schedule.id.startsWith("new-") ? null : schedule.id, payload: payload as unknown as Json, exceptions: exceptions as unknown as Json });
  return error ? { ok: false, mode, message: error.message } : { ok: true, mode, message: "Transfer schedule saved." };
}

export async function savePartnerManualAvailability(entries: Array<{ roomId?: string; date: string; roomsAvailable: number | null; rate: number | null; currency: string }>): Promise<PartnerPortalActionResult> {
  const { scope, supabase, mode } = await getScopedSupabase();
  if (!supabase || scope.mode !== "supabase" || scope.listingType !== "property") return { ok: false, mode, message: "Property owner access is required." };
  const normalized = entries.map((item) => ({ roomId: item.roomId ?? "", date: item.date, roomsAvailable: item.roomsAvailable, rate: item.rate, currency: item.currency, restrictions: {} }));
  const { error } = await supabase.rpc("partner_save_manual_availability", { actor_user_id: scope.authUserId, partner_uuid: scope.partnerId, property_uuid: scope.propertyId, entries: normalized as unknown as Json });
  return error ? { ok: false, mode, message: error.message } : { ok: true, mode, message: "Manual availability saved." };
}

export async function setPartnerAvailabilityProvider(provider: AvailabilityProvider): Promise<PartnerPortalActionResult> {
  const { scope, supabase, mode } = await getScopedSupabase();
  if (!supabase || scope.mode !== "supabase" || scope.listingType !== "property") return { ok: false, mode, message: "Property owner access is required." };
  const { error } = await supabase.rpc("partner_set_availability_provider", { actor_user_id: scope.authUserId, partner_uuid: scope.partnerId, property_uuid: scope.propertyId, provider_name: provider });
  return error ? { ok: false, mode, message: error.message } : { ok: true, mode, message: "Availability source saved. No OTA password is stored." };
}
