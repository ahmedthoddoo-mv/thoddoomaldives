import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getPublicBusinessMediaMap } from "@/lib/business-media/server";
import { mapTransferRowToDomain } from "@/lib/supabase/mappers";
import type { TransferSchedule } from "@/types/transfer-schedule";

type ScheduleRow = Pick<import("@/lib/supabase/types").Tables<"transfer_schedules">, "id" | "transfer_id" | "direction" | "departure_point" | "arrival_point" | "days_of_week" | "departure_time" | "effective_start" | "effective_end" | "friday_specific" | "price" | "currency" | "unit" | "vessel_capacity" | "vessel_details" | "luggage_policy" | "pickup_dropoff" | "cancellation_notice" | "weather_notice" | "active">;
type ExceptionRow = Pick<import("@/lib/supabase/types").Tables<"transfer_schedule_exceptions">, "schedule_id" | "exception_date" | "departure_time" | "cancelled" | "notice">;

function mapSchedule(row: ScheduleRow, exceptions: ExceptionRow[] = []): TransferSchedule {
  return {
    id: row.id, transferId: row.transfer_id, direction: row.direction, departurePoint: row.departure_point,
    arrivalPoint: row.arrival_point, daysOfWeek: row.days_of_week, departureTime: row.departure_time,
    effectiveStart: row.effective_start ?? undefined, effectiveEnd: row.effective_end ?? undefined,
    fridaySpecific: row.friday_specific, price: row.price, currency: row.currency, unit: row.unit,
    vesselCapacity: row.vessel_capacity, vesselDetails: row.vessel_details ?? undefined,
    luggagePolicy: row.luggage_policy ?? undefined, pickupDropoff: row.pickup_dropoff ?? undefined,
    cancellationNotice: row.cancellation_notice ?? undefined, weatherNotice: row.weather_notice ?? undefined,
    active: row.active,
    exceptions: exceptions.filter((item) => item.schedule_id === row.id).map((item) => ({
      date: item.exception_date, departureTime: item.departure_time ?? undefined, cancelled: item.cancelled, notice: item.notice ?? undefined
    }))
  };
}

export const SupabaseTransferRepository = {
  async findAll() {
    const supabase = createSupabaseServiceRoleClient() ?? createSupabaseServerClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase.from("transfers").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => mapTransferRowToDomain(row));
  },
  async findPublished() {
    const supabase = createSupabaseServerClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase.from("public_transfers").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    const ids = (data ?? []).map((row) => row.id).filter((id): id is string => Boolean(id));
    const mediaMap = await getPublicBusinessMediaMap("transfer", ids);
    return (data ?? []).map((row) => mapTransferRowToDomain(row as Parameters<typeof mapTransferRowToDomain>[0], mediaMap.get(row.id ?? "") ?? []));
  },
  async findById(id: string) {
    const rows = await this.findAll();
    return rows.find((row) => row.id === id);
  },
  async findBySlug(slug: string) {
    const supabase = createSupabaseServerClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase
      .from("public_transfers")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return undefined;
    }
    const mediaMap = await getPublicBusinessMediaMap("transfer", [data.id ?? ""].filter((id): id is string => Boolean(id)));
    return mapTransferRowToDomain(data as Parameters<typeof mapTransferRowToDomain>[0], mediaMap.get(data.id ?? "") ?? []);
  },
  async findPublishedSchedules(transferId: string) {
    const supabase = createSupabaseServerClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const [{ data, error }, { data: exceptions, error: exceptionError }] = await Promise.all([
      supabase.from("public_transfer_schedules").select("*").eq("transfer_id", transferId).eq("active", true).order("departure_time"),
      supabase.from("public_transfer_schedule_exceptions").select("*").gte("exception_date", new Date().toISOString().slice(0, 10))
    ]);
    if (error) throw error;
    if (exceptionError) throw exceptionError;
    return (data ?? []).map((row) => mapSchedule(row as ScheduleRow, (exceptions ?? []) as ExceptionRow[]));
  },
  async findAllSchedules(transferId: string) {
    const supabase = createSupabaseServiceRoleClient() ?? createSupabaseServerClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const [{ data, error }, { data: exceptions, error: exceptionError }] = await Promise.all([
      supabase.from("transfer_schedules").select("*").eq("transfer_id", transferId).order("departure_time"),
      supabase.from("transfer_schedule_exceptions").select("*").order("exception_date")
    ]);
    if (error) throw error;
    if (exceptionError) throw exceptionError;
    return (data ?? []).map((row) => mapSchedule(row, exceptions ?? []));
  },
  async findFeatured() {
    const rows = await this.findAll();
    return rows.filter((row) => row.featured);
  },
  async findVerified() {
    return this.findFeatured();
  },
  async search(query: string) {
    const rows = await this.findAll();
    return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(query.toLowerCase()));
  }
};
