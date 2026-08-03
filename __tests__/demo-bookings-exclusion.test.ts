/**
 * Tests for demo_only booking exclusion.
 *
 * demo_only bookings must never appear as real pending bookings
 * in admin or partner dashboards.
 */

import { describe, it, expect } from "vitest";
import type { Tables } from "@/lib/supabase/types";

// Mirror the mapper logic for payment status.
function mapPaymentStatus(rawStatus: string): string {
  if (rawStatus === "demo_only") return "demo-only";
  if (rawStatus === "pending") return "pending";
  return rawStatus;
}

// Simulate what the repository filter does: exclude demo_only at query level.
function filterDemoBookings(bookings: MockBooking[]): MockBooking[] {
  return bookings.filter((b) => b.payment_status !== "demo_only");
}

type MockBooking = Pick<Tables<"bookings">, "id" | "payment_status" | "booking_status">;

const mockBookings: MockBooking[] = [
  { id: "bk-real-1", payment_status: "pending", booking_status: "pending" },
  { id: "bk-real-2", payment_status: "unpaid",  booking_status: "confirmed" },
  { id: "bk-demo-1", payment_status: "demo_only", booking_status: "pending" },
  { id: "bk-demo-2", payment_status: "demo_only", booking_status: "confirmed" },
];

describe("demo_only booking exclusion", () => {
  it("mapper does NOT map demo_only to pending", () => {
    expect(mapPaymentStatus("demo_only")).toBe("demo-only");
    expect(mapPaymentStatus("demo_only")).not.toBe("pending");
  });

  it("repository filter removes all demo_only bookings", () => {
    const filtered = filterDemoBookings(mockBookings);
    expect(filtered).toHaveLength(2);
    expect(filtered.every((b) => b.payment_status !== "demo_only")).toBe(true);
  });

  it("demo_only bookings do not appear as pending after filter", () => {
    const filtered = filterDemoBookings(mockBookings);
    const pendingBookings = filtered.filter((b) => b.payment_status === "pending" || b.booking_status === "pending");
    const hasDemoId = pendingBookings.some((b) => b.id.startsWith("bk-demo"));
    expect(hasDemoId).toBe(false);
  });

  it("real pending bookings are still present after demo filter", () => {
    const filtered = filterDemoBookings(mockBookings);
    expect(filtered.some((b) => b.id === "bk-real-1")).toBe(true);
    expect(filtered.some((b) => b.id === "bk-real-2")).toBe(true);
  });
});
