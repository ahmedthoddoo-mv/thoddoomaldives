"use client";

import { useEffect, useState } from "react";
import { calculateCommission } from "@/lib/booking";
import { createBookingTimelineEvents } from "@/lib/bookings/bookingCrm";
import { createBookingEmailPreviews } from "@/lib/bookings/bookingEmails";
import type {
  BookingEmailPreview,
  BookingTimelineEvent,
  BookingWorkflowPayload,
  BookingWorkflowRecord
} from "@/types/booking-workflow";
import type { Booking, BookingStatus } from "@/types/booking";

const BOOKING_STORAGE_KEY = "ithoddoo.demo.bookings.v1";
const TIMELINE_STORAGE_KEY = "ithoddoo.demo.bookingTimeline.v1";
const EMAIL_STORAGE_KEY = "ithoddoo.demo.bookingEmails.v1";
const BOOKING_EVENT = "ithoddoo:bookings-changed";

function isBrowser() {
  return typeof window !== "undefined";
}

function emitChange() {
  if (isBrowser()) {
    window.dispatchEvent(new Event(BOOKING_EVENT));
  }
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizeInitialBooking(booking: Booking): BookingWorkflowRecord {
  return {
    ...booking,
    contactPreference: "whatsapp",
    specialRequests: "",
    createdAt: "2026-07-11T00:00:00.000Z",
    updatedAt: "2026-07-11T00:00:00.000Z"
  };
}

function readStoredBookings() {
  return readJson<BookingWorkflowRecord[]>(BOOKING_STORAGE_KEY, []);
}

function writeStoredBookings(bookings: BookingWorkflowRecord[]) {
  writeJson(BOOKING_STORAGE_KEY, bookings);
  emitChange();
}

function mergeBookings(initialBookings: Booking[]) {
  const byId = new Map<string, BookingWorkflowRecord>();

  initialBookings.map(normalizeInitialBooking).forEach((booking) => byId.set(booking.id, booking));
  readStoredBookings().forEach((booking) => byId.set(booking.id, booking));

  return Array.from(byId.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function saveTimeline(events: BookingTimelineEvent[]) {
  const existing = readJson<BookingTimelineEvent[]>(TIMELINE_STORAGE_KEY, []);
  const byId = new Map(existing.map((event) => [event.id, event]));
  events.forEach((event) => byId.set(event.id, event));
  writeJson(TIMELINE_STORAGE_KEY, Array.from(byId.values()));
}

function saveEmailPreviews(previews: BookingEmailPreview[]) {
  const existing = readJson<BookingEmailPreview[]>(EMAIL_STORAGE_KEY, []);
  const byId = new Map(existing.map((preview) => [preview.id, preview]));
  previews.forEach((preview) => byId.set(preview.id, preview));
  writeJson(EMAIL_STORAGE_KEY, Array.from(byId.values()));
}

export function createBookingRequest(payload: BookingWorkflowPayload) {
  const now = new Date().toISOString();
  const id = `BK-DEMO-${Date.now()}`;
  const commission = calculateCommission(payload.estimatedValue, payload.commissionRate);
  const booking: BookingWorkflowRecord = {
    id,
    guest: {
      name: payload.guestName,
      email: payload.guestEmail,
      whatsapp: payload.guestWhatsapp,
      adults: payload.adults,
      children: payload.children
    },
    guestRecordId: `guest-${id.toLowerCase()}`,
    propertyId: payload.propertyId ?? payload.propertySlug ?? payload.propertyName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    propertyName: payload.propertyName,
    propertySlug: payload.propertySlug,
    partnerId: payload.partnerId ?? "partner-thoddoo-sun-sky",
    crmRecordId: payload.crmRecordId ?? "crm-thoddoo-sun-sky",
    arrival: payload.checkIn,
    departure: payload.checkOut,
    roomType: payload.roomType,
    nights: payload.nights,
    services: [],
    estimatedValue: payload.estimatedValue,
    commission,
    status: payload.status ?? "pending",
    paymentStatus: "demo-only",
    source: "website",
    contactPreference: payload.contactPreference,
    specialRequests: payload.specialRequests,
    createdAt: now,
    updatedAt: now
  };
  const bookings = readStoredBookings();

  writeStoredBookings([booking, ...bookings]);
  saveTimeline(createBookingTimelineEvents(booking));
  saveEmailPreviews(createBookingEmailPreviews(booking));

  return booking;
}

export function updateBookingStatus(id: string, status: BookingStatus) {
  const bookings = readStoredBookings().map((booking) =>
    booking.id === id ? { ...booking, status, updatedAt: new Date().toISOString() } : booking
  );
  writeStoredBookings(bookings);
}

export function getBookingTimelineEvents() {
  return readJson<BookingTimelineEvent[]>(TIMELINE_STORAGE_KEY, []);
}

export function getBookingEmailPreviews() {
  return readJson<BookingEmailPreview[]>(EMAIL_STORAGE_KEY, []);
}

export function subscribeToBookingStore(callback: () => void) {
  if (!isBrowser()) return () => undefined;

  window.addEventListener(BOOKING_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(BOOKING_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useBookingWorkflow(initialBookings: Booking[]) {
  const [, setVersion] = useState(0);

  useEffect(() => {
    return subscribeToBookingStore(() => setVersion((version) => version + 1));
  }, []);

  return mergeBookings(initialBookings);
}

export function useBookingTimeline() {
  const [events, setEvents] = useState<BookingTimelineEvent[]>(getBookingTimelineEvents);

  useEffect(() => {
    return subscribeToBookingStore(() => setEvents(getBookingTimelineEvents()));
  }, []);

  return events;
}
