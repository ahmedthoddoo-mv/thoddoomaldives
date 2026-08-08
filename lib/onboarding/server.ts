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

export async function loadBusinessOnboardingDraft(id: string, ownerType: BusinessOnboardingDraftOwnerType) {
  const db = createSupabaseServiceRoleClient();
  if (!db) return null;
  const table = db as unknown as OnboardingSupabaseTableClient;

  if (ownerType === "admin") {
    const admin = await requireAdminSession();
    const { data, error } = await table
      .from("business_onboarding_drafts")
      .select("*")
      .eq("id", id)
      .eq("owner_type", "admin")
      .eq("owner_id", admin.userId)
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
  if (!db) return { ok: false as const, message: "Supabase service role is not configured." };
  const table = db as unknown as OnboardingSupabaseTableClient;

  let ownerId = "";
  if (input.ownerType === "admin") {
    const admin = await requireAdminSession();
    ownerId = admin.userId;
  } else {
    const scope = await getAuthorizedPartnerScope();
    if (scope.mode !== "supabase") return { ok: false as const, message: "Partner access is required." };
    ownerId = scope.partnerId;
  }

  const normalizedBusinessType = normalizeBusinessTypeValue(input.businessType);
  const mergedValues = mergeBusinessOnboardingValues(
    getDefaultBusinessOnboardingValues(normalizedBusinessType),
    asBusinessOnboardingValues(input.values)
  );
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
    status: "draft"
  };

  let savedId = input.draftId;
  if (input.draftId) {
    await table.from("business_onboarding_drafts").update(row).eq("id", input.draftId).eq("owner_type", input.ownerType).eq("owner_id", ownerId);
  } else {
    const { data, error } = await table.from("business_onboarding_drafts").insert(row).select("id").single();
    if (error || !data) return { ok: false as const, message: error?.message ?? "The draft could not be saved." };
    savedId = data.id as string;
  }

  revalidatePath("/admin/businesses");
  revalidatePath("/partner/onboarding");
  return { ok: true as const, draftId: savedId, message: "Draft saved." };
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
  const payload = mapOnboardingValuesToListingPayload(values as Record<string, unknown>, normalizedBusinessType);
  const { data, error } = await db.rpc("admin_save_business_listing", {
    admin_user_id: admin.userId,
    listing_type: normalizedBusinessType === "restaurant" ? "restaurant" : "restaurant",
    listing_uuid: input.listingId ?? (draft.listing_id as string | null) ?? null,
    listing_payload: payload as Json
  });
  if (error) return { ok: false as const, message: error.message };

  const listingId = (data as { id?: string } | null | undefined)?.id ?? (input.listingId ?? draft.listing_id ?? null);
  await table.from("business_onboarding_drafts").update({ status: "published", listing_id: listingId, data: values, current_step: "publish" }).eq("id", input.draftId);
  revalidatePublicListingPaths();
  revalidatePath("/admin/businesses");
  return { ok: true as const, listingId, message: "Listing published." };
}
