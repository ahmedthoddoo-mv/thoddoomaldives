"use server";

import { headers } from "next/headers";
import { calculateCommission, calculateNights } from "@/lib/booking";
import { requireAdminSession } from "@/lib/admin/adminAuth";
import { platformConfig } from "@/lib/config/platform";
import { sendEmail } from "@/lib/email/client";
import { buildAdminNotificationEmail } from "@/lib/email/templates/admin-notification";
import { buildBookingConfirmationEmail } from "@/lib/email/templates/booking-confirmation";
import type { SendEmailResult } from "@/lib/email/types";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { SupabaseDatabaseClient } from "@/lib/supabase/server";
import { getDataMode } from "@/lib/supabase/status";
import { mapBookingRowToDomain } from "@/lib/supabase/mappers";
import type { Database, Tables } from "@/lib/supabase/types";
import type { ContactPreference } from "@/types/booking-workflow";
import type { Booking, BookingStatus, PaymentStatus } from "@/types/booking";

export type RealBookingInput = {
  propertyId?: string;
  propertySlug?: string;
  roomId?: string;
  selectedServiceIds?: string[];
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  guestName: string;
  guestEmail: string;
  guestWhatsapp: string;
  contactPreference: ContactPreference;
  specialRequests: string;
  turnstileToken: string;
};

export type RealBookingResult = {
  ok: boolean;
  mode: "mock" | "supabase";
  message: string;
  errors?: string[];
  enquiry?: {
    id: string;
    reference: string;
    propertyId: string;
    propertyName: string;
    checkIn: string;
    checkOut: string;
    roomName: string;
  };
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

type TurnstileVerification = {
  success?: boolean;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
};

async function verifyTurnstileToken(token: string) {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret || !token.trim()) return false;
  const requestHeaders = await headers();
  const remoteIp = requestHeaders.get("cf-connecting-ip") || requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const body = new URLSearchParams({ secret, response: token.trim() });
  if (remoteIp) body.set("remoteip", remoteIp);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store"
  });
  if (!response.ok) return false;
  const result = await response.json() as TurnstileVerification;
  return result.success === true && result.action === "turnstile-spin-v2";
}

function getCapacityLimit(room: Tables<"rooms">) {
  const parsedCapacity = Number.parseInt(room.capacity.match(/\d+/)?.[0] ?? "", 10);
  return Number.isFinite(parsedCapacity) ? parsedCapacity : room.adults + room.children;
}

function validateBookingInput(input: RealBookingInput, room?: Tables<"rooms">, roomRequired = false) {
  const errors: string[] = [];
  const nights = calculateNights(input.checkIn, input.checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkInDate = input.checkIn ? new Date(`${input.checkIn}T00:00:00`) : null;
  const totalGuests = input.adults + input.children;

  if (!input.propertyId && !input.propertySlug) errors.push("Choose a property.");
  if (roomRequired && !input.roomId) errors.push("Choose a room.");
  if (!input.checkIn) errors.push("Choose a check-in date.");
  if (!input.checkOut) errors.push("Choose a check-out date.");
  if (input.checkIn && Number.isNaN(new Date(`${input.checkIn}T00:00:00`).getTime())) errors.push("Check-in date is invalid.");
  if (input.checkOut && Number.isNaN(new Date(`${input.checkOut}T00:00:00`).getTime())) errors.push("Check-out date is invalid.");
  if (checkInDate && checkInDate <= today) errors.push("Check-in date must be in the future.");
  if (input.checkIn && input.checkOut && nights <= 0) errors.push("Check-out must be after check-in.");
  if (!input.guestName.trim()) errors.push("Guest name is required.");
  const hasEmail = validateEmail(input.guestEmail.trim());
  const hasWhatsapp = input.guestWhatsapp.replace(/\D/g, "").length >= 7;
  if (!hasEmail && !hasWhatsapp) errors.push("Provide a valid email or WhatsApp number.");
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

async function createBookingReference() {
  const year = new Date().getFullYear();
  return `ITM-${year}-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
}

async function saveBookingCrmPlaceholders(
  db: SupabaseDatabaseClient,
  booking: Booking,
  partnerId?: string | null
) {
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

  if (!(await verifyTurnstileToken(input.turnstileToken))) {
    return {
      ok: false,
      mode: "supabase",
      message: "Enquiry verification failed.",
      errors: ["Please complete the security check and try again."]
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

  const db = supabase;
  const lookupById = isUuid(input.propertyId);
  const propertyLookupValue = lookupById ? input.propertyId! : input.propertySlug!;
  const propertyQuery = db
    .from("properties")
    .select("*, partners(*)")
    .eq(lookupById ? "id" : "slug", propertyLookupValue)
    .eq("publication_status", "published")
    .eq("verification_status", "verified")
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

  const { data: availableRooms, error: availableRoomsError } = await db
    .from("rooms")
    .select("*")
    .eq("property_id", property.id)
    .eq("active", true);
  const rooms = (availableRooms ?? []) as Tables<"rooms">[];
  const room = input.roomId ? rooms.find((item) => item.id === input.roomId) ?? null : null;
  const validation = validateBookingInput(input, room ?? undefined, rooms.length > 0);

  if (availableRoomsError) {
    validation.errors.push("Room information could not be verified.");
  } else if (input.roomId && !room) {
    validation.errors.push("Selected room is not available for this property.");
  }

  const selectedServiceIds = Array.from(new Set(input.selectedServiceIds ?? []));
  const { data: serviceRows, error: serviceError } = selectedServiceIds.length > 0
    ? await db.from("partner_service_items").select("id, price, currency")
      .in("id", selectedServiceIds).eq("property_id", property.id).eq("active", true).eq("public_visible", true)
    : { data: [], error: null };
  if (serviceError || (serviceRows?.length ?? 0) !== selectedServiceIds.length) {
    validation.errors.push("One or more selected services do not belong to this property.");
  }

  if (validation.errors.length > 0) {
    return {
      ok: false,
      mode: "supabase",
      message: "Please fix the booking details.",
      errors: validation.errors
    };
  }

  const nights = calculateNights(input.checkIn, input.checkOut);
  const taxesFees = 0;
  const roomRate = room?.price_per_night && room.price_per_night > 0 ? Number(room.price_per_night) : null;
  const pricedServices = (serviceRows ?? []).every((service) => service.price !== null && Number(service.price) > 0);
  const servicesTotal = pricedServices
    ? (serviceRows ?? []).reduce((total, service) => total + Number(service.price), 0)
    : null;
  const quotedAmount = roomRate !== null && servicesTotal !== null ? nights * roomRate + servicesTotal : null;
  const commission = quotedAmount === null ? null : calculateCommission(quotedAmount, 0.1);
  const bookingReference = await createBookingReference();

  const { data: guest, error: guestError } = await db
    .from("guests")
    .insert({
      full_name: input.guestName.trim(),
      email: input.guestEmail.trim() || null,
      whatsapp: input.guestWhatsapp.trim() || null
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
      room_id: room?.id ?? null,
      partner_id: property.partner_id,
      check_in: input.checkIn,
      check_out: input.checkOut,
      adults: input.adults,
      children: input.children,
      booking_total: quotedAmount,
      taxes_fees: taxesFees,
      commission_percent: 10,
      company_revenue: commission?.companyRevenue ?? null,
      partner_revenue: commission?.partnerRevenue ?? null,
      booking_status: "pending",
      payment_status: "unpaid",
      contact_preference: input.contactPreference,
      nights,
      source: "website_enquiry",
      selected_service_ids: selectedServiceIds,
      quoted_amount: quotedAmount,
      quote_currency: quotedAmount !== null ? room?.currency ?? property.currency ?? "USD" : null,
      special_requests: input.specialRequests.trim() || null
    })
    .select("*, guests(*), properties(*), rooms(*)")
    .single();

  if (bookingError || !bookingData) {
    const rollback = await db.from("guests").delete().eq("id", guest.id);
    if (rollback.error) {
      console.error("[booking-enquiry-rollback]", { guestId: guest.id, code: rollback.error.code });
    }
    return {
      ok: false,
      mode: "supabase",
      message: "Booking could not be saved.",
      errors: [bookingError?.message ?? "Please try again or contact us by WhatsApp."]
    };
  }

  const bookingRow = bookingData as unknown as BookingWithRelations;
  const booking = mapBookingRowToDomain(bookingRow, bookingRow.guests ?? undefined, bookingRow.properties ?? undefined, bookingRow.rooms ?? undefined);
  await saveBookingCrmPlaceholders(db, booking, property.partner_id);
  const siteUrl = platformConfig.companyContact.website.replace(/\/$/, "");
  const bookingUrl = `${siteUrl}/booking/success?reference=${encodeURIComponent(booking.reference ?? booking.id)}`;
  const guestEmailResult: Promise<SendEmailResult> = input.guestEmail.trim()
    ? sendEmail({
        to: { address: input.guestEmail.trim(), name: input.guestName.trim() || booking.guest.name },
        ...buildBookingConfirmationEmail({
          guestName: booking.guest.name,
          reference: booking.reference ?? booking.id,
          propertyName: booking.propertyName,
          checkIn: booking.arrival,
          checkOut: booking.departure,
          dashboardUrl: bookingUrl,
          siteUrl
        })
      })
    : Promise.resolve({
        ok: true,
        skipped: true,
        messageId: null,
        reason: "Guest email was not provided."
      } satisfies SendEmailResult);
  const emailResults = await Promise.allSettled([
    guestEmailResult,
    sendEmail({
      to: platformConfig.companyContact.email,
      ...buildAdminNotificationEmail({
        title: `New booking enquiry: ${booking.reference ?? booking.id}`,
        summary: `${booking.guest.name} sent a booking enquiry for ${booking.propertyName}.`,
        adminUrl: `${siteUrl}/admin/bookings`,
        siteUrl
      })
    })
  ]);
  const emailWarnings = emailResults.flatMap((result) => {
    if (result.status === "rejected") return ["Email delivery failed."];
    if (result.value.skipped && result.value.reason !== "Guest email was not provided.") return [result.value.reason];
    return [];
  });

  return {
    ok: true,
    mode: "supabase",
    message: `Enquiry ${booking.reference ?? booking.id} has been submitted.${emailWarnings.length > 0 ? ` ${emailWarnings.join(" ")}` : ""}`,
    enquiry: {
      id: booking.id,
      reference: booking.reference ?? booking.id,
      propertyId: property.id,
      propertyName: property.name,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      roomName: room?.name ?? "Accommodation enquiry"
    }
  };
}

export async function updateAdminBookingStatus(params: {
  bookingId: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  roomPrepared?: boolean;
  internalNotes?: string;
}) {
  const { bookingId, status, paymentStatus, roomPrepared, internalNotes } = params;

  if (!isSupabaseMode()) {
    return { ok: false, mode: "mock" as const, message: "Mock mode is active." };
  }

  await requireAdminSession();
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return { ok: false, mode: "supabase" as const, message: "Supabase service role is not configured." };
  }

  if (status === "new" || status === "draft") {
    return { ok: false, mode: "supabase" as const, message: "Bookings cannot be moved back to draft or new from this workflow." };
  }

  const db = supabase;
  const { data: existingBooking, error: existingError } = await db
    .from("bookings")
    .select("id, partner_id")
    .eq("id", bookingId)
    .maybeSingle();

  if (existingError || !existingBooking) {
    return { ok: false, mode: "supabase" as const, message: "Booking was not found." };
  }

  const payload: Database["public"]["Tables"]["bookings"]["Update"] = {};
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
