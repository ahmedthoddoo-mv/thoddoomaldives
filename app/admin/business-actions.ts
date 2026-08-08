"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin/adminAuth";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import { revalidatePublicListingPaths } from "@/lib/cache/publicRoutes";
import type { TransferSchedule } from "@/types/transfer-schedule";

type AdminRestaurantMenuDefinition = Array<{
  name: string;
  items: Array<{
    name: string;
    description?: string;
    priceMvr?: number;
    available?: boolean;
    public?: boolean;
  }>;
}>;

function parseInteractiveMenuDefinition(value: unknown): AdminRestaurantMenuDefinition {
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
                priceMvr: typeof item.priceMvr === "number" ? item.priceMvr : typeof item.price_mvr === "number" ? item.price_mvr : undefined,
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

async function saveInteractiveMenu(db: NonNullable<ReturnType<typeof createSupabaseServiceRoleClient>>, restaurantId: string, definition: AdminRestaurantMenuDefinition) {
  if (!restaurantId) return;
  const { error: categoriesError } = await db.from("restaurant_menu_categories" as any).delete().eq("restaurant_id", restaurantId); // eslint-disable-line @typescript-eslint/no-explicit-any
  if (categoriesError) return;
  const { error: itemsError } = await db.from("restaurant_menu_items" as any).delete().eq("restaurant_id", restaurantId); // eslint-disable-line @typescript-eslint/no-explicit-any
  if (itemsError) return;

  for (const [categoryIndex, category] of definition.entries()) {
    const { data: categoryRow, error: categoryError } = await db
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
      await db.from("restaurant_menu_items" as any).insert(itemRows as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
  }
}

export type AdminBusinessKind = "transfer" | "experience" | "restaurant";

export async function saveAdminBusinessListing(input: {
  kind: AdminBusinessKind;
  id?: string;
  values: Record<string, string | boolean | string[] | number>;
}) {
  const admin = await requireAdminSession();
  const db = createSupabaseServiceRoleClient();
  if (!db) return { ok: false, message: "Supabase service role is not configured." };
  const { data, error } = await db.rpc("admin_save_business_listing", {
    admin_user_id: admin.userId,
    listing_type: input.kind,
    listing_uuid: input.id ?? null,
    listing_payload: input.values as Json
  });
  if (error) return { ok: false, message: error.message };
  if (input.kind === "restaurant") {
    const restaurantId = (data as { id?: string } | null | undefined)?.id;
    const definition = parseInteractiveMenuDefinition(input.values.interactiveMenu);
    if (restaurantId && definition.length > 0) {
      await saveInteractiveMenu(db, restaurantId, definition);
    }
  }
  revalidatePublicListingPaths();
  revalidatePath("/admin/applications");
  return { ok: true, message: "Business listing saved.", data };
}

export async function saveAdminTransferSchedule(transferId: string, schedule: TransferSchedule) {
  const admin = await requireAdminSession();
  const db = createSupabaseServiceRoleClient();
  if (!db) return { ok: false, message: "Supabase service role is not configured." };
  const { data: transfer, error: transferError } = await db.from("transfers").select("partner_id").eq("id", transferId).maybeSingle();
  if (transferError || !transfer?.partner_id) return { ok: false, message: transferError?.message ?? "A partner-linked transfer is required for schedules." };
  const row = { transfer_id: transferId, partner_id: transfer.partner_id, direction: schedule.direction.trim(), departure_point: schedule.departurePoint.trim(), arrival_point: schedule.arrivalPoint.trim(), days_of_week: schedule.daysOfWeek, departure_time: schedule.departureTime, effective_start: schedule.effectiveStart || null, effective_end: schedule.effectiveEnd || null, friday_specific: schedule.fridaySpecific, price: schedule.price, currency: schedule.currency, unit: schedule.unit, vessel_capacity: schedule.vesselCapacity, vessel_details: schedule.vesselDetails || null, luggage_policy: schedule.luggagePolicy || null, pickup_dropoff: schedule.pickupDropoff || null, cancellation_notice: schedule.cancellationNotice || null, weather_notice: schedule.weatherNotice || null, active: schedule.active, updated_by: admin.userId };
  const query = schedule.id.startsWith("new-") ? db.from("transfer_schedules").insert(row) : db.from("transfer_schedules").update(row).eq("id", schedule.id).eq("transfer_id", transferId);
  const { data, error } = await query.select("id").single();
  if (error) return { ok: false, message: error.message };
  await db.from("transfer_schedule_exceptions").delete().eq("schedule_id", data.id);
  if (schedule.exceptions.length) {
    const { error: exceptionError } = await db.from("transfer_schedule_exceptions").insert(schedule.exceptions.map((item) => ({ schedule_id: data.id, exception_date: item.date, departure_time: item.departureTime || null, cancelled: item.cancelled, notice: item.notice || null, updated_by: admin.userId })));
    if (exceptionError) return { ok: false, message: exceptionError.message };
  }
  await db.from("partner_audit_events").insert({ partner_id: transfer.partner_id, auth_user_id: admin.userId, event_type: "transfer_schedule_update", metadata: { transferId, scheduleId: data.id, actor: "admin" } });
  revalidatePublicListingPaths();
  return { ok: true, message: "Transfer schedule saved." };
}
