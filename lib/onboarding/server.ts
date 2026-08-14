"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin/adminAuth";
import { getAuthorizedPartnerScope } from "@/lib/partner-portal/partnerAccess";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import { revalidatePublicListingPaths } from "@/lib/cache/publicRoutes";
import {
  buildSlug,
  getBusinessOnboardingDefinition,
  getDefaultBusinessOnboardingValues,
  mergeBusinessOnboardingValues,
  parseGuesthouseRooms,
  type BusinessOnboardingValue,
  type BusinessOnboardingValues
} from "@/lib/onboarding/businessOnboardingDefinitions";

export type BusinessOnboardingDraftOwnerType = "admin" | "partner";
export type BusinessOnboardingDraftRecord = {
  id: string;
  ownerType: BusinessOnboardingDraftOwnerType;
  ownerId: string;
  businessType: string;
  listingId: string | null;
  currentStep: string;
  values: Record<string, unknown>;
  status: string;
  createdAt: string;
  updatedAt: string;
};

function normalizeBusinessTypeValue(kind: string) {
  return getBusinessOnboardingDefinition(kind).key;
}

type OnboardingSupabaseQuery = {
  select: (columns: string) => OnboardingSupabaseQuery;
  eq: (column: string, value: unknown) => OnboardingSupabaseQuery;
  maybeSingle: () => Promise<{ data: Record<string, unknown> | null; error: { message?: string } | null }>;
  insert: (row: Record<string, unknown>) => OnboardingSupabaseQuery;
  update: (row: Record<string, unknown>) => OnboardingSupabaseQuery;
  single: () => Promise<{ data: { id?: string } | null; error: { message?: string } | null }>;
};

type OnboardingSupabaseTableClient = {
  from: (table: string) => OnboardingSupabaseQuery;
};

function readStringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readNullableStringValue(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readRecordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asBusinessOnboardingValues(values: Record<string, unknown>): BusinessOnboardingValues {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, value as BusinessOnboardingValue])
  ) as BusinessOnboardingValues;
}

function splitLines(value: unknown) {
  return String(value ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsePositivePrice(value: string) {
  const parsed = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function mapOnboardingValuesToListingPayload(values: Record<string, unknown>, businessType: string) {
  const title = String(values.title ?? "").trim();
  const payload = {
    title,
    description: String(values.description ?? values.shortDescription ?? "").trim(),
    shortDescription: String(values.shortDescription ?? "").trim(),
    location: String(values.island ?? "").trim(),
    cuisine: String(values.cuisine ?? "").trim(),
    price: String(values.priceRange ?? "").trim(),
    openingHours: String(values.hoursText ?? "").trim(),
    phone: String(values.phone ?? "").trim(),
    whatsapp: String(values.whatsapp ?? "").trim(),
    email: String(values.email ?? "").trim(),
    website: String(values.website ?? "").trim(),
    instagram: String(values.instagram ?? "").trim(),
    facebook: String(values.facebook ?? "").trim(),
    address: String(values.address ?? "").trim(),
    latitude: String(values.latitude ?? "").trim(),
    longitude: String(values.longitude ?? "").trim(),
    image: String(values.coverUrl ?? values.logoUrl ?? "").trim(),
    publicationStatus: String(values.publicationStatus ?? "draft"),
    verificationStatus: String(values.verificationStatus ?? "pending"),
    featured: Boolean(values.featured),
    showOriginalMenu: Boolean(values.showOriginalMenu),
    promotionTitle: String(values.promotionTitle ?? "").trim(),
    promotionDescription: String(values.promotionDescription ?? "").trim(),
    promotionMediaUrl: String(values.promotionMediaUrl ?? "").trim(),
    promotionCtaLabel: String(values.promotionCtaLabel ?? "").trim(),
    promotionCtaDestination: String(values.promotionCtaDestination ?? "").trim(),
    promotionActive: Boolean(values.promotionActive),
    interactiveMenu: String(values.interactiveMenu ?? "[]"),
    sourceMenuUrl: String(values.sourceMenuUrl ?? "").trim(),
    slug: String(values.slug ?? buildSlug(title)).trim() || buildSlug(title)
  };

  if (businessType === "restaurant") return payload;
  return payload;
}

function mapOnboardingValuesToPropertyPayload(values: Record<string, unknown>) {
  const rooms = parseGuesthouseRooms(values.guesthouseRooms);
  const firstPricedRoom = rooms.find((room) => parsePositivePrice(room.basePrice) !== null);
  const facilities = splitLines(values.facilities);
  const bookingChannels = splitLines(values.bookingChannels);
  const bookingLinks = {
    bookingComUrl: String(values.bookingComUrl ?? "").trim(),
    airbnbUrl: String(values.airbnbUrl ?? "").trim(),
    expediaUrl: String(values.expediaUrl ?? "").trim(),
    directBookingUrl: String(values.directBookingUrl ?? "").trim()
  };
  const nearbyAttractions = splitLines(values.nearbyAttractions).map((entry) => {
    const [name = "", distance = "", description = ""] = entry.split("|").map((part) => part.trim());
    return { name, distance, description };
  }).filter((entry) => entry.name);
  const languages = splitLines(values.languagesSpoken);
  const roomCount = Number(values.numberOfRooms ?? 0) || rooms.reduce((total, room) => total + Math.max(1, room.quantity), 0);
  return {
    property: {
      name: String(values.title ?? "").trim(),
      slug: String(values.slug ?? buildSlug(String(values.title ?? ""))).trim() || buildSlug(String(values.title ?? "")),
      island: String(values.island ?? "").trim(),
      address: String(values.address ?? "").trim(),
      latitude: String(values.latitude ?? "").trim(),
      longitude: String(values.longitude ?? "").trim(),
      whatsapp: String(values.whatsapp ?? "").trim(),
      phone: String(values.phone ?? "").trim(),
      email: String(values.email ?? "").trim(),
      website: String(values.website ?? "").trim(),
      google_maps_link: String(values.mapUrl ?? "").trim(),
      short_description: String(values.shortDescription ?? "").trim(),
      full_description: String(values.description ?? values.shortDescription ?? "").trim(),
      hero_image_path: String(values.coverUrl ?? values.logoUrl ?? values.galleryUrl ?? "").trim(),
      amenities: splitLines(values.amenities),
      policies: splitLines(values.guesthousePolicies ?? values.policies),
      check_in_time: String(values.checkIn ?? "").trim(),
      check_out_time: String(values.checkOut ?? "").trim(),
      operating_hours: String(values.hoursText ?? "").trim(),
      publication_status: String(values.publicationStatus ?? "draft"),
      verification_status: String(values.verificationStatus ?? "pending"),
      featured: Boolean(values.featured),
      room_count: roomCount || null,
      starting_price: firstPricedRoom ? parsePositivePrice(firstPricedRoom.basePrice) : null,
      currency: firstPricedRoom?.basePrice.toUpperCase().includes("MVR") ? "MVR" : "USD",
      languages,
      metadata: {
        propertyType: String(values.propertyType ?? "").trim(),
        facilities,
        bookingChannels,
        bookingLinks,
        nearbyAttractions,
        roomDefinitions: rooms,
        mapUrl: String(values.mapUrl ?? "").trim(),
        membership: String(values.membershipTier ?? "verified").toLowerCase()
      }
    },
    rooms: rooms.map((room) => ({
      name: room.name.trim(),
      bed_type: room.bedType.trim() || null,
      capacity: `${Math.max(1, room.maxGuests)} guest${Math.max(1, room.maxGuests) === 1 ? "" : "s"}`,
      adults: Math.max(1, room.maxGuests),
      children: 0,
      price_per_night: parsePositivePrice(room.basePrice),
      currency: room.basePrice.toUpperCase().includes("MVR") ? "MVR" : "USD",
      breakfast_included: room.amenities.some((amenity) => amenity.toLowerCase().includes("breakfast")),
      description: room.description.trim() || null
    })),
    roomMetadata: rooms.reduce<Record<string, { amenities: string[]; gallery: string[]; featured: boolean; quantity: number; maxGuests: number }>>((result, room) => {
      result[room.name.trim().toLowerCase()] = {
        amenities: room.amenities,
        gallery: room.gallery,
        featured: room.featured,
        quantity: Math.max(1, room.quantity),
        maxGuests: Math.max(1, room.maxGuests)
      };
      return result;
    }, {})
  };
}

export async function loadBusinessOnboardingDraft(id: string, ownerType: BusinessOnboardingDraftOwnerType) {
  const db = createSupabaseServiceRoleClient();
  if (!db) return null;
  const table = db as unknown as OnboardingSupabaseTableClient;

  if (ownerType === "admin") {
    await requireAdminSession();
    const { data, error } = await table
      .from("business_onboarding_drafts")
      .select("*")
      .eq("id", id)
      .eq("owner_type", "admin")
      .maybeSingle();
    if (error || !data) return null;
    return {
      id: readStringValue(data.id),
      ownerType: readStringValue(data.owner_type) as BusinessOnboardingDraftOwnerType,
      ownerId: readStringValue(data.owner_id),
      businessType: readStringValue(data.business_type),
      listingId: readNullableStringValue(data.listing_id),
      currentStep: readStringValue(data.current_step),
      values: readRecordValue(data.data),
      status: readStringValue(data.status),
      createdAt: readStringValue(data.created_at),
      updatedAt: readStringValue(data.updated_at)
    } satisfies BusinessOnboardingDraftRecord;
  }

  const scope = await getAuthorizedPartnerScope();
  if (scope.mode !== "supabase") return null;
  const { data, error } = await table
    .from("business_onboarding_drafts")
    .select("*")
    .eq("id", id)
    .eq("owner_type", "partner")
    .eq("owner_id", scope.partnerId)
    .maybeSingle();
  if (error || !data) return null;

  return {
    id: readStringValue(data.id),
    ownerType: readStringValue(data.owner_type) as BusinessOnboardingDraftOwnerType,
    ownerId: readStringValue(data.owner_id),
    businessType: readStringValue(data.business_type),
    listingId: readNullableStringValue(data.listing_id),
    currentStep: readStringValue(data.current_step),
    values: readRecordValue(data.data),
    status: readStringValue(data.status),
    createdAt: readStringValue(data.created_at),
    updatedAt: readStringValue(data.updated_at)
  } satisfies BusinessOnboardingDraftRecord;
}

export async function saveBusinessOnboardingDraft(input: {
  draftId?: string;
  ownerType: BusinessOnboardingDraftOwnerType;
  businessType: string;
  currentStep?: string;
  listingId?: string | null;
  values: Record<string, unknown>;
}) {
  const db = createSupabaseServiceRoleClient();
  if (!db) {
    return { ok: false as const, message: "Supabase service role is not configured." };
  }
  const table = db as unknown as OnboardingSupabaseTableClient;

  let ownerId = "";
  if (input.ownerType === "admin") {
    const admin = await requireAdminSession();
    ownerId = admin.userId;
  } else {
    const scope = await getAuthorizedPartnerScope();
    if (scope.mode !== "supabase") {
      return { ok: false as const, message: "Partner access is required." };
    }
    ownerId = scope.partnerId;
  }

  const normalizedBusinessType = normalizeBusinessTypeValue(input.businessType);
  const mergedValues = mergeBusinessOnboardingValues(
    getDefaultBusinessOnboardingValues(normalizedBusinessType),
    asBusinessOnboardingValues(input.values)
  );
  if (input.ownerType === "partner") {
    mergedValues.membershipTier = getDefaultBusinessOnboardingValues(normalizedBusinessType).membershipTier;
    mergedValues.verificationStatus = "pending";
    mergedValues.publicationStatus = "draft";
    mergedValues.featured = false;
  }
  const payload = {
    ...mergedValues,
    slug: String(mergedValues.slug ?? buildSlug(String(mergedValues.title ?? ""))).trim() || buildSlug(String(mergedValues.title ?? ""))
  };

  const row = {
    owner_type: input.ownerType,
    owner_id: ownerId,
    business_type: normalizedBusinessType,
    listing_id: input.listingId ?? null,
    current_step: input.currentStep ?? "business",
    data: payload,
    status: "draft",
    updated_at: new Date().toISOString()
  };

  let savedId = input.draftId;
  if (input.draftId) {
    const updateResult = await table.from("business_onboarding_drafts").update(row).eq("id", input.draftId).eq("owner_type", input.ownerType).eq("owner_id", ownerId);
    const error = (updateResult as { error?: { message?: string } | null } | null)?.error ?? null;
    if (error) {
      return { ok: false as const, message: error.message };
    }
  } else {
    const { data, error } = await table.from("business_onboarding_drafts").insert(row).select("id").single();
    if (error || !data) {
      return { ok: false as const, message: error?.message ?? "The draft could not be saved." };
    }
    savedId = data.id as string;
  }

  revalidatePath("/admin/businesses");
  revalidatePath("/partner/onboarding");
  const resumePath = input.ownerType === "admin"
    ? `/admin/businesses/${savedId}/onboarding`
    : `/partner/onboarding?draftId=${savedId}`;
  return { ok: true as const, draftId: savedId, resumePath, message: "Draft saved." };
}

export async function publishBusinessOnboardingDraft(input: {
  draftId: string;
  businessType: string;
  values: Record<string, unknown>;
  listingId?: string | null;
}) {
  const db = createSupabaseServiceRoleClient();
  if (!db) return { ok: false as const, message: "Supabase service role is not configured." };
  const table = db as unknown as OnboardingSupabaseTableClient;

  const admin = await requireAdminSession();
  const { data: draft, error: draftError } = await table
    .from("business_onboarding_drafts")
    .select("*")
    .eq("id", input.draftId)
    .eq("owner_type", "admin")
    .eq("owner_id", admin.userId)
    .maybeSingle();
  if (draftError || !draft) return { ok: false as const, message: draftError?.message ?? "Draft not found." };

  const normalizedBusinessType = normalizeBusinessTypeValue(input.businessType);
  const values = mergeBusinessOnboardingValues(getDefaultBusinessOnboardingValues(normalizedBusinessType), asBusinessOnboardingValues(input.values));
  let listingId: string | null = input.listingId ?? (draft.listing_id as string | null) ?? null;
  if (normalizedBusinessType === "guesthouse") {
    const guesthouse = mapOnboardingValuesToPropertyPayload(values as Record<string, unknown>);
    const { data, error } = await db.rpc("admin_save_property", {
      admin_user_id: admin.userId,
      property_uuid: (listingId ?? undefined) as string,
      property_payload: guesthouse.property as Json,
      room_payload: guesthouse.rooms as Json,
      media_payload: [] as Json
    });
    if (error) return { ok: false as const, message: error.message };
    listingId = (data as { propertyId?: string } | null | undefined)?.propertyId ?? listingId;
    if (listingId) {
      await db
        .from("properties")
        .update({
          phone: String(guesthouse.property.phone || "").trim() || null,
          google_maps_link: String(guesthouse.property.google_maps_link || "").trim() || null,
          operating_hours: String(guesthouse.property.operating_hours || "").trim() || null,
          room_count: guesthouse.property.room_count ?? null,
          starting_price: guesthouse.property.starting_price ?? null,
          currency: guesthouse.property.currency ?? null,
          metadata: guesthouse.property.metadata as Json,
          languages: guesthouse.property.languages
        })
        .eq("id", listingId);
      const { data: roomRows } = await db.from("rooms").select("id, name").eq("property_id", listingId);
      for (const row of roomRows ?? []) {
        const metadata = guesthouse.roomMetadata[String(row.name).trim().toLowerCase()];
        if (!metadata) continue;
        await db
          .from("rooms")
          .update({
            amenities: metadata.amenities,
            image_paths: metadata.gallery,
            metadata: {
              featured: metadata.featured,
              quantity: metadata.quantity,
              maxGuests: metadata.maxGuests
            } as Json
          })
          .eq("id", row.id);
      }
    }
  } else {
    const payload = mapOnboardingValuesToListingPayload(values as Record<string, unknown>, normalizedBusinessType);
    const { data, error } = await db.rpc("admin_save_business_listing", {
      admin_user_id: admin.userId,
      listing_type: normalizedBusinessType === "transfer"
        ? "transfer"
        : normalizedBusinessType === "experience"
          ? "experience"
          : "restaurant",
      listing_uuid: (listingId ?? undefined) as string,
      listing_payload: payload as Json
    });
    if (error) return { ok: false as const, message: error.message };
    listingId = (data as { id?: string } | null | undefined)?.id ?? listingId;
  }

  await table.from("business_onboarding_drafts").update({ status: "published", listing_id: listingId, data: values, current_step: "publish" }).eq("id", input.draftId);
  revalidatePublicListingPaths();
  revalidatePath("/admin/businesses");
  return { ok: true as const, listingId, message: "Listing published." };
}
