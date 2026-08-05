import "server-only";

import { getAuthorizedPartnerScope } from "@/lib/partner-portal/partnerAccess";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { AvailabilityProvider, RoomAvailability } from "@/types/availability";
import type { TransferSchedule } from "@/types/transfer-schedule";

export async function getPartnerOperationsData() {
  const scope = await getAuthorizedPartnerScope();
  const db = createSupabaseServiceRoleClient();
  if (!db || scope.mode !== "supabase") return { scope, schedules: [] as TransferSchedule[], availability: [] as RoomAvailability[], provider: "manual" as AvailabilityProvider };

  if (scope.listingType === "transfer") {
    const [{ data: rows }, { data: exceptions }] = await Promise.all([
      db.from("transfer_schedules").select("*").eq("partner_id", scope.partnerId).eq("transfer_id", scope.listingId).order("departure_time"),
      db.from("transfer_schedule_exceptions").select("*").order("exception_date")
    ]);
    return { scope, availability: [] as RoomAvailability[], provider: "manual" as AvailabilityProvider, schedules: (rows ?? []).map((row) => ({
      id: row.id, transferId: row.transfer_id, direction: row.direction, departurePoint: row.departure_point, arrivalPoint: row.arrival_point,
      daysOfWeek: row.days_of_week, departureTime: row.departure_time, effectiveStart: row.effective_start ?? undefined,
      effectiveEnd: row.effective_end ?? undefined, fridaySpecific: row.friday_specific, price: row.price, currency: row.currency,
      unit: row.unit, vesselCapacity: row.vessel_capacity, vesselDetails: row.vessel_details ?? undefined, luggagePolicy: row.luggage_policy ?? undefined,
      pickupDropoff: row.pickup_dropoff ?? undefined, cancellationNotice: row.cancellation_notice ?? undefined,
      weatherNotice: row.weather_notice ?? undefined, active: row.active,
      exceptions: (exceptions ?? []).filter((item) => item.schedule_id === row.id).map((item) => ({ date: item.exception_date, departureTime: item.departure_time ?? undefined, cancelled: item.cancelled, notice: item.notice ?? undefined }))
    })) };
  }

  if (scope.listingType === "property") {
    const [{ data: rows }, { data: integration }] = await Promise.all([
      db.from("room_availability").select("*").eq("partner_id", scope.partnerId).eq("property_id", scope.propertyId).gte("availability_date", new Date().toISOString().slice(0, 10)).order("availability_date"),
      db.from("availability_integrations").select("provider").eq("property_id", scope.propertyId).maybeSingle()
    ]);
    return { scope, schedules: [] as TransferSchedule[], provider: (integration?.provider ?? "manual") as AvailabilityProvider, availability: (rows ?? []).map((row) => ({
      id: row.id, propertyId: row.property_id, roomId: row.room_id ?? undefined, date: row.availability_date,
      roomsAvailable: row.rooms_available, rate: row.rate, currency: row.currency,
      restrictions: row.restrictions && typeof row.restrictions === "object" && !Array.isArray(row.restrictions) ? row.restrictions : {},
      provider: row.provider as AvailabilityProvider, lastSynchronizedAt: row.last_synchronized_at ?? undefined, syncStatus: row.sync_status
    })) };
  }
  return { scope, schedules: [] as TransferSchedule[], availability: [] as RoomAvailability[], provider: "manual" as AvailabilityProvider };
}
