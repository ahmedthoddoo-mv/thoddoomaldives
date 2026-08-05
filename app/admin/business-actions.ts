"use server";

import { requireAdminSession } from "@/lib/admin/adminAuth";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import { revalidatePublicListingPaths } from "@/lib/cache/publicRoutes";
import type { TransferSchedule } from "@/types/transfer-schedule";

export type AdminBusinessKind = "transfer" | "experience" | "restaurant";

export async function saveAdminBusinessListing(input: {
  kind: AdminBusinessKind;
  id?: string;
  values: Record<string, string | boolean | string[]>;
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
  revalidatePublicListingPaths();
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
