import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapBookingRowToDomain } from "@/lib/supabase/mappers";
import type { Tables } from "@/lib/supabase/types";

type BookingWithRelations = Tables<"bookings"> & {
  guests?: Tables<"guests"> | null;
  properties?: Tables<"properties"> | null;
  rooms?: Tables<"rooms"> | null;
};

export const SupabaseBookingRepository = {
  async findAll() {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];
    const { data } = await supabase.from("bookings").select("*, guests(*), properties(*), rooms(*)").order("created_at", { ascending: false });
    return ((data ?? []) as BookingWithRelations[]).map((booking) =>
      mapBookingRowToDomain(booking, booking.guests ?? undefined, booking.properties ?? undefined, booking.rooms ?? undefined)
    );
  },
  async findById(id: string) {
    const bookings = await this.findAll();
    return bookings.find((booking) => booking.id === id);
  },
  async findBySlug(slug: string) {
    return this.findById(slug);
  },
  async findFeatured() {
    const bookings = await this.findAll();
    return bookings.filter((booking) => booking.status === "new" || booking.status === "pending");
  },
  async findVerified() {
    const bookings = await this.findAll();
    return bookings.filter((booking) => booking.status === "confirmed");
  },
  async search(query: string) {
    const bookings = await this.findAll();
    return bookings.filter((booking) => JSON.stringify(booking).toLowerCase().includes(query.toLowerCase()));
  }
};
