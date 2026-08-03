/**
 * Migration safety tests for 202607310002_correct_approved_room_prices.sql
 *
 * These tests verify the SQL logic by simulating the data conditions and
 * asserting which rooms would (and would not) be touched.
 */

import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Helpers that mirror the migration WHERE clauses in TypeScript so we can
// unit-test the predicate logic without a live database.
// ---------------------------------------------------------------------------

type Room = {
  id: string;
  property_id: string;
  name: string;
  price_per_night: number;
  active: boolean;
};

type Property = {
  id: string;
  partner_id: string | null;
};

type Partner = {
  id: string;
};

type Application = {
  id: string;
  status: string;
  partner_id: string | null;
};

type ApplicationPrice = {
  application_id: string;
  item_name: string;
  price: number | null;
  active: boolean;
};

function isManagedByApplication(
  room: Room,
  properties: Property[],
  partners: Partner[],
  applications: Application[]
): boolean {
  const property = properties.find((p) => p.id === room.property_id);
  if (!property?.partner_id) return false;
  const partner = partners.find((p) => p.id === property.partner_id);
  if (!partner) return false;
  return applications.some(
    (app) => app.status === "approved" && app.partner_id === partner.id
  );
}

function wouldBeDeactivated(
  room: Room,
  properties: Property[],
  partners: Partner[],
  applications: Application[],
  prices: ApplicationPrice[]
): boolean {
  if (!room.active) return false;
  if (!isManagedByApplication(room, properties, partners, applications)) return false;
  const property = properties.find((p) => p.id === room.property_id)!;
  const partner = partners.find((p) => p.id === property.partner_id!)!;
  const app = applications.find((a) => a.status === "approved" && a.partner_id === partner.id)!;
  const matchedPrice = prices.find(
    (pr) =>
      pr.application_id === app.id &&
      pr.active &&
      pr.item_name.toLowerCase().trim() === room.name.toLowerCase().trim()
  );
  return !matchedPrice;
}

function wouldGetPriceUpdated(
  room: Room,
  properties: Property[],
  partners: Partner[],
  applications: Application[],
  prices: ApplicationPrice[]
): number | null {
  if (!isManagedByApplication(room, properties, partners, applications)) return null;
  const property = properties.find((p) => p.id === room.property_id)!;
  const partner = partners.find((p) => p.id === property.partner_id!)!;
  const app = applications.find((a) => a.status === "approved" && a.partner_id === partner.id)!;
  const matchedPrice = prices.find(
    (pr) =>
      pr.application_id === app.id &&
      pr.active &&
      pr.price !== null &&
      pr.item_name.toLowerCase().trim() === room.name.toLowerCase().trim()
  );
  return matchedPrice?.price ?? null;
}

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const partnerA: Partner = { id: "partner-a" };
const partnerB: Partner = { id: "partner-b" }; // unrelated — no approved app
const partnerC: Partner = { id: "partner-c" }; // another application's partner

const propertyA: Property = { id: "prop-a", partner_id: "partner-a" };
const propertyB: Property = { id: "prop-b", partner_id: "partner-b" }; // unrelated
const propertyC: Property = { id: "prop-c", partner_id: "partner-c" };
const propertyManual: Property = { id: "prop-manual", partner_id: null }; // manually created, no partner

const appA: Application = { id: "app-a", status: "approved", partner_id: "partner-a" };
const appC: Application = { id: "app-c", status: "approved", partner_id: "partner-c" };
// appB intentionally absent — partnerB has no approved application.

const rooms: Room[] = [
  { id: "room-1", property_id: "prop-a", name: "Deluxe Double", price_per_night: 50, active: true },
  { id: "room-2", property_id: "prop-a", name: "Old Room", price_per_night: 40, active: true },
  { id: "room-3", property_id: "prop-b", name: "Unrelated Room", price_per_night: 80, active: true },
  { id: "room-4", property_id: "prop-manual", name: "Manual Room", price_per_night: 60, active: true },
  { id: "room-5", property_id: "prop-c", name: "Sea View", price_per_night: 100, active: true },
];

const prices: ApplicationPrice[] = [
  { application_id: "app-a", item_name: "Deluxe Double", price: 75, active: true },
  // "Old Room" not in prices → should be deactivated
  { application_id: "app-c", item_name: "Sea View", price: 110, active: true },
];

const properties = [propertyA, propertyB, propertyC, propertyManual];
const partners = [partnerA, partnerB, partnerC];
const applications = [appA, appC];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("migration 202607310002_correct_approved_room_prices", () => {
  it("deactivates stale rooms belonging to an approved application's property", () => {
    const staleRoom = rooms.find((r) => r.id === "room-2")!;
    expect(wouldBeDeactivated(staleRoom, properties, partners, applications, prices)).toBe(true);
  });

  it("does NOT deactivate rooms belonging to an unrelated property (no approved application)", () => {
    const unrelatedRoom = rooms.find((r) => r.id === "room-3")!;
    expect(wouldBeDeactivated(unrelatedRoom, properties, partners, applications, prices)).toBe(false);
  });

  it("does NOT deactivate manually created rooms (property has no partner_id)", () => {
    const manualRoom = rooms.find((r) => r.id === "room-4")!;
    expect(wouldBeDeactivated(manualRoom, properties, partners, applications, prices)).toBe(false);
  });

  it("does NOT deactivate rooms for another application when room name matches that application's prices", () => {
    const seaViewRoom = rooms.find((r) => r.id === "room-5")!;
    expect(wouldBeDeactivated(seaViewRoom, properties, partners, applications, prices)).toBe(false);
  });

  it("updates price for rooms matching an approved application price", () => {
    const deluxeRoom = rooms.find((r) => r.id === "room-1")!;
    const newPrice = wouldGetPriceUpdated(deluxeRoom, properties, partners, applications, prices);
    expect(newPrice).toBe(75);
  });

  it("does NOT update price for rooms of unrelated properties", () => {
    const unrelatedRoom = rooms.find((r) => r.id === "room-3")!;
    expect(wouldGetPriceUpdated(unrelatedRoom, properties, partners, applications, prices)).toBeNull();
  });

  it("does NOT update price for manually created rooms", () => {
    const manualRoom = rooms.find((r) => r.id === "room-4")!;
    expect(wouldGetPriceUpdated(manualRoom, properties, partners, applications, prices)).toBeNull();
  });
});
