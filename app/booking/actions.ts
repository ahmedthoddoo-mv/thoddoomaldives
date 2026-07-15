"use server";

import { createBookingEmailPreviews } from "@/lib/bookings/bookingEmails";
import { calculateCommission, calculateNights } from "@/lib/booking";
import { hasAdminDemoSession } from "@/lib/admin/adminAuth";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getDataMode } from "@/lib/supabase/status";
import { mapBookingRowToDomain } from "@/lib/supabase/mappers";
import type { Tables } from "@/lib/supabase/types";
import type { ContactPreference, BookingEmailPreview } from "@/types/booking-workflow";
import type { Booking, BookingStatus, PaymentStatus } from "@/types/booking";

export type RealBookingInput = {
  propertyId?: string;
  propertySlug?: string;
  roomId?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  guestName: string;
  guestEmail: string;
  guestWhatsapp: string;
  contactPreference: ContactPreference;
  specialRequests: string;
};

export type RealBookingResult = {
  ok: boolean;
  mode: "mock" | "supabase";
  message: string;
  errors?: string[];
  booking?: Booking;
  emailPreviews?: BookingEmailPreview[];
};

type PropertyWithPartner = Tables<"properties"> & {
  partners?: Tables<"partners"> | null;
};

type BookingWithRelations = Tables<"bookings"> & {
  guests?: Tables<"guests"> | null;
  properties?: Tables<"properties"> | null;
  rooms?: Tables<"rooms"> | null;
};

function isSupabaseMode() {
  return getDataMode() === "supabase";
}

function isUuid(value?: string) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateContactPreference(value: ContactPreference) {
  return value === "whatsapp" || value === "email" || value === "either";
}

function getCapacityLimit(room: Tables<"rooms">) {
  const parsedCapacity = Number.parseInt(room.capacity.match(/\d+/)?.[0] ?? "", 10);
  return Number.isFinite(parsedCapacity) ? parsedCapacity : room.adults + room.children;
}

function validateBookingInput(input: RealBookingInput, room?: Tables<"rooms">) {
  const errors: string[] = [];
  const nights = calculateNights(input.checkIn, input.checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkInDate = input.checkIn ? new Date(`${input.checkIn}T00:00:00`) : null;
  const totalGuests = input.adults + input.children;

  if (!input.propertyId && !input.propertySlug) errors.push("Choose a property.");
  if (!input.roomId) errors.push("Choose a room.");
  if (!input.checkIn) errors.push("Choose a check-in date.");
  if (!input.checkOut) errors.push("Choose a check-out date.");
  if (input.checkIn && Number.isNaN(new Date(`${input.checkIn}T00:00:00`).getTime())) errors.push("Check-in date is invalid.");
  if (input.checkOut && Number.isNaN(new Date(`${input.checkOut}T00:00:00`).getTime())) errors.push("Check-out date is invalid.");
  if (checkInDate && checkInDate < today) errors.push("Check-in date cannot be in the past.");
  if (input.checkIn && input.checkOut && nights <= 0) errors.push("Check-out must be after check-in.");
  if (!input.guestName.trim()) errors.push("Guest name is required.");
  if (!validateEmail(input.guestEmail.trim())) errors.push("A valid email is required.");
  if (input.guestWhatsapp.replace(/\D/g, "").length < 7) errors.push("A valid WhatsApp number is required.");
  if (input.adults < 1) errors.push("At least one adult is required.");
  if (input.children < 0) errors.push("Children cannot be negative.");
  if (totalGuests < 1) errors.push("Add at least one guest.");
  if (!validateContactPreference(input.contactPreference)) errors.push("Choose a valid contact preference.");

  if (room) {
    if (totalGuests > getCapacityLimit(room)) {
      errors.push(`Selected room capacity is ${room.capacity}.`);
    }

    if (input.adults > room.adults) {
      errors.push(`Selected room supports up to ${room.adults} adults.`);
    }

    if (input.children > room.children) {
      errors.push(`Selected room supports up to ${room.children} children.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

async function createBookingReference(db: any) {
  const year = new Date().getFullYear();
  const startOfYear = `${year}-01-01T00:00:00.000Z`;
  const { count } = await db
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .gte("created_at", startOfYear);
  const nextNumber = (count ?? 0) + 1;

  return `ITM-${year}-${String(nextNumber).padStart(6, "0")}`;
}

function createEmailPreviewsFromBooking(booking: Booking): BookingEmailPreview[] {
  const now = new Date().toISOString();

  return createBookingEmailPreviews({
    ...booking,
    contactPreference: "whatsapp",
    specialRequests: booking.internalNotes ?? "",
    createdAt: now,
    updatedAt: now
  });
}

async function saveBookingCrmPlaceholders(db: any, booking: Booking, partnerId?: string | null) {
  if (!partnerId) return;

  await db.from("crm_notes").insert({
    partner_id: partnerId,
    author: "Booking System",
    body: `Booking ${booking.reference ?? booking.id} submitted by ${booking.guest.name}. Dates: ${booking.arrival} to ${booking.departure}.`
  });

  await db.from("crm_tasks").insert({
    partner_id: partnerId,
    title: `Follow up booking ${booking.reference ?? booking.id}`,
    task_type: "Booking Follow-up",
    owner: "Operations",
    due_date: booking.arrival,
    status: "open",
    priority: "high"
  });
}

export async function submitRealBookingRequest(input: RealBookingInput): Promise<RealBookingResult> {
  if (!isSupabaseMode()) {
    return {
      ok: false,
      mode: "mock",
      message: "Mock mode is active. Use the browser demo booking workflow."
    };
  }

  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return {
      ok: false,
      mode: "supabase",
      message: "Supabase service role is not configured.",
      errors: ["Booking could not be saved. Please contact iThoddoo Maldives."]
    };
  }

  const db = supabase as any;
  const propertyQuery = db
    .from("properties")
    .select("*, partners(*)")
    .eq(isUuid(input.propertyId) ? "id" : "slug", isUuid(input.propertyId) ? input.propertyId : input.propertySlug)
    .eq("publication_status", "published")
    .maybeSingle();
  const { data: propertyData, error: propertyError } = await propertyQuery;
  const property = propertyData as PropertyWithPartner | null;

  if (propertyError || !property) {
    return {
      ok: false,
      mode: "supabase",
      message: "Property is not available for booking.",
      errors: ["This property is not published or could not be found."]
    };
  }

  const { data: roomData, error: roomError } = await db
    .from("rooms")
    .select("*")
    .eq("id", input.roomId)
    .eq("property_id", property.id)
    .eq("active", true)
    .maybeSingle();
  const room = roomData as Tables<"rooms"> | null;
  const validation = validateBookingInput(input, room ?? undefined);

  if (roomError || !room) {
    validation.errors.push("Selected room is not available for this property.");
  }

  if (!validation.valid || !room) {
    return {
      ok: false,
      mode: "supabase",
      message: "Please fix the booking details.",
      errors: validation.errors
    };
  }

  const nights = calculateNights(input.checkIn, input.checkOut);
  const taxesFees = 0;
  const bookingTotal = nights * Number(room.price_per_night) + taxesFees;
  const commission = calculateCommission(bookingTotal, 0.1);
  const bookingReference = await createBookingReference(db);

  const { data: guest, error: guestError } = await db
    .from("guests")
    .insert({
      full_name: input.guestName.trim(),
      email: input.guestEmail.trim(),
      whatsapp: input.guestWhatsapp.trim()
    })
    .select("*")
    .single();

  if (guestError || !guest) {
    return {
      ok: false,
      mode: "supabase",
      message: "Guest record could not be created.",
      errors: ["Please try again or contact us by WhatsApp."]
    };
  }

  const { data: bookingData, error: bookingError } = await db
    .from("bookings")
    .insert({
      booking_reference: bookingReference,
      guest_id: guest.id,
      property_id: property.id,
      room_id: room.id,
      partner_id: property.partner_id,
      check_in: input.checkIn,
      check_out: input.checkOut,
      adults: input.adults,
      children: input.children,
      booking_total: bookingTotal,
      taxes_fees: taxesFees,
      commission_percent: 10,
      company_revenue: commission.companyRevenue,
      partner_revenue: commission.partnerRevenue,
      booking_status: "pending",
      payment_status: "unpaid",
      contact_preference: input.contactPreference,
      special_requests: input.specialRequests.trim() || null
    })
    .select("*, guests(*), properties(*), rooms(*)")
    .single();

  if (bookingError || !bookingData) {
    return {
      ok: false,
      mode: "supabase",
      message: "Booking could not be saved.",
      errors: [bookingError?.message ?? "Please try again or contact us by WhatsApp."]
    };
  }

  const bookingRow = bookingData as BookingWithRelations;
  const booking = mapBookingRowToDomain(bookingRow, bookingRow.guests ?? undefined, bookingRow.properties ?? undefined, bookingRow.rooms ?? undefined);
  const emailPreviews = createEmailPreviewsFromBooking(booking);
  await saveBookingCrmPlaceholders(db, booking, property.partner_id);

  return {
    ok: true,
    mode: "supabase",
    message: `Booking request ${booking.reference ?? booking.id} has been submitted.`,
    booking,
    emailPreviews
  };
}

export async function updateRealBookingStatus(params: {
  bookingId: string;
  actor?: "admin" | "partner";
  partnerId?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  roomPrepared?: boolean;
  internalNotes?: string;
}) {
  const { bookingId, status, paymentStatus, roomPrepared, internalNotes } = params;

  if (!isSupabaseMode()) {
    return { ok: false, mode: "mock" as const, message: "Mock mode is active." };
  }

  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return { ok: false, mode: "supabase" as const, message: "Supabase service role is not configured." };
  }

  if (status === "new" || status === "draft") {
    return { ok: false, mode: "supabase" as const, message: "Bookings cannot be moved back to draft or new from this workflow." };
  }

  const actor = params.actor ?? "admin";
  if (actor === "admin" && !(await hasAdminDemoSession())) {
    return { ok: false, mode: "supabase" as const, message: "Admin session is required." };
  }

  const db = supabase as any;
  const { data: existingBooking, error: existingError } = await db
    .from("bookings")
    .select("id, partner_id")
    .eq("id", bookingId)
    .maybeSingle();

  if (existingError || !existingBooking) {
    return { ok: false, mode: "supabase" as const, message: "Booking was not found." };
  }

  if (actor === "partner" && (!params.partnerId || existingBooking.partner_id !== params.partnerId)) {
    return { ok: false, mode: "supabase" as const, message: "Partner booking access is not valid for this record." };
  }

  const payload: Record<string, string | boolean | null> = {};
  if (status) payload.booking_status = status;
  if (paymentStatus) payload.payment_status = paymentStatus === "demo-only" ? "demo_only" : paymentStatus;
  if (typeof roomPrepared === "boolean") payload.room_prepared = roomPrepared;
  if (typeof internalNotes === "string") payload.internal_notes = internalNotes.trim() || null;

  if (Object.keys(payload).length === 0) {
    return { ok: true, mode: "supabase" as const, message: "No booking changes to save." };
  }

  const { error } = await db.from("bookings").update(payload).eq("id", bookingId);
  if (error) {
    return { ok: false, mode: "supabase" as const, message: error.message };
  }

  return { ok: true, mode: "supabase" as const, message: "Booking updated." };
}
