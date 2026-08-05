import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { availabilityFreshness, availabilityStatus } from "../lib/availability/status.ts";
import { nextTransferDeparture } from "../lib/transfers/schedule.ts";
import type { TransferSchedule } from "../types/transfer-schedule.ts";

const migration = readFileSync(new URL("../supabase/migrations/202608040001_partner_operations_schedules_availability.sql", import.meta.url), "utf8");
const partnerActions = readFileSync(new URL("../app/partner/actions.ts", import.meta.url), "utf8");
const propertyMapper = readFileSync(new URL("../lib/supabase/mappers.ts", import.meta.url), "utf8");
const transferPage = readFileSync(new URL("../app/transfer/[slug]/page.tsx", import.meta.url), "utf8");

function schedule(overrides: Partial<TransferSchedule>): TransferSchedule {
  return { id: "schedule", transferId: "transfer", direction: "Thoddoo → Malé Airport", departurePoint: "Thoddoo", arrivalPoint: "Malé Airport", daysOfWeek: [0,1,2,3,4,6], departureTime: "13:00", fridaySpecific: false, price: 35, currency: "USD", unit: "per person one way", vesselCapacity: 40, active: true, exceptions: [], ...overrides };
}

test("Friday schedule uses the Friday-specific 14:00 departure", () => {
  const schedules = [schedule({ id: "normal", daysOfWeek: [0,1,2,3,4,5,6] }), schedule({ id: "friday", daysOfWeek: [5], departureTime: "14:00", fridaySpecific: true })];
  const next = nextTransferDeparture(schedules, new Date("2026-08-07T07:00:00Z"));
  assert.equal(next?.date, "2026-08-07");
  assert.equal(next?.time, "14:00");
});

test("duplicate schedule rows produce one public departure", () => {
  const duplicate = schedule({ id: "duplicate" });
  const next = nextTransferDeparture([schedule({ id: "normal" }), duplicate], new Date("2026-08-06T07:00:00Z"));
  assert.equal(next?.time, "13:00");
});

test("normal Saturday to Thursday schedule uses 13:00", () => {
  const schedules = [schedule({ id: "normal" }), schedule({ id: "friday", daysOfWeek: [5], departureTime: "14:00", fridaySpecific: true })];
  assert.equal(nextTransferDeparture(schedules, new Date("2026-08-06T07:00:00Z"))?.time, "13:00");
});

test("schedule exception can replace a normal departure", () => {
  const next = nextTransferDeparture([schedule({ exceptions: [{ date: "2026-08-06", departureTime: "15:30", cancelled: false }] })], new Date("2026-08-06T07:00:00Z"));
  assert.equal(next?.time, "15:30");
});

test("manual availability maps honest public statuses", () => {
  assert.equal(availabilityStatus({ roomsAvailable: 4 }), "Available");
  assert.equal(availabilityStatus({ roomsAvailable: 1 }), "Limited");
  assert.equal(availabilityStatus({ roomsAvailable: null }), "On request");
  assert.equal(availabilityStatus({ roomsAvailable: 0 }), "Unavailable");
  assert.match(availabilityFreshness({ provider: "manual", lastSynchronizedAt: undefined, syncStatus: "manual" }), /Manual calendar/);
});

test("stale provider availability shows the last successful synchronization", () => {
  assert.match(availabilityFreshness({ provider: "pms", lastSynchronizedAt: "2026-08-01T10:00:00Z", syncStatus: "stale" }), /Last successful synchronization/);
});

test("partner mutations and RLS enforce ownership and edit suspension", () => {
  assert.match(migration, /p\.auth_user_id = actor_user_id and not p\.editing_suspended/);
  assert.match(migration, /Room ownership mismatch/);
  assert.match(migration, /Schedule ownership mismatch/);
  assert.match(partnerActions, /scope\.listingType !== "transfer"/);
  assert.match(partnerActions, /scope\.listingType !== "property"/);
  assert.match(migration, /join public\.transfers t on t\.partner_id=p\.id/);
  assert.match(migration, /join public\.properties pr on pr\.partner_id=p\.id/);
});

test("public schedule views omit partner and actor identifiers", () => {
  const scheduleView = migration.match(/create or replace view public\.public_transfer_schedules[\s\S]*?;/)?.[0] ?? "";
  const exceptionView = migration.match(/create or replace view public\.public_transfer_schedule_exceptions[\s\S]*?;/)?.[0] ?? "";
  assert.doesNotMatch(scheduleView, /select s\.\*/);
  assert.doesNotMatch(scheduleView, /partner_id|updated_by/);
  assert.doesNotMatch(exceptionView, /select e\.\*/);
  assert.doesNotMatch(exceptionView, /updated_by/);
});

test("room rate and room-specific photo fields are mapped from live rows", () => {
  assert.match(propertyMapper, /price_per_night/);
  assert.match(propertyMapper, /image_paths\[0\]/);
});

test("public transfer page renders structured schedule and stored unit", () => {
  assert.match(transferPage, /Weekly timetable/);
  assert.match(transferPage, /nextTransferDeparture/);
  assert.match(transferPage, /schedules\[0\]\.unit/);
});

test("schema and UI contain no fake Booking.com availability or OTA password fields", () => {
  assert.doesNotMatch(`${migration}\n${partnerActions}`, /booking\.com.*password|ota_password|owner_password/i);
  assert.match(migration, /booking_connectivity_future/);
});
