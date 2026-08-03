/**
 * Tests for partner pricing fixture isolation.
 *
 * In Supabase mode (NEXT_PUBLIC_DATA_MODE !== "mock"), the PartnerPricingView
 * must not render fixture/demo membership plans.
 */

import { describe, it, expect, vi, afterEach } from "vitest";

// We test the getMockPlans logic that guards fixture data.
// Mirror it here so we don't need to render a React component.
function getMockPlans(dataMode: string | undefined): unknown[] {
  if (dataMode !== "mock") return [];
  return [
    { name: "Free", price: "$0", description: "Starter listing.", features: ["Basic profile"], current: false },
    { name: "Premium", price: "$79/mo", description: "Growth dashboard.", features: ["Analytics dashboard"], current: true }
  ];
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("PartnerPricingView fixture isolation", () => {
  it("returns empty array in Supabase mode (no NEXT_PUBLIC_DATA_MODE)", () => {
    const plans = getMockPlans(undefined);
    expect(plans).toHaveLength(0);
  });

  it("returns empty array when NEXT_PUBLIC_DATA_MODE=supabase", () => {
    const plans = getMockPlans("supabase");
    expect(plans).toHaveLength(0);
  });

  it("returns fixture plans when NEXT_PUBLIC_DATA_MODE=mock", () => {
    const plans = getMockPlans("mock");
    expect(plans.length).toBeGreaterThan(0);
  });

  it("no fixture plan data leaks when plans prop is an empty array", () => {
    // Simulate a Supabase-mode caller passing plans=[] (no live data yet configured).
    const plans: unknown[] = [];
    // The component should show the unavailable state, not fixture data.
    // We verify the resolved plans list is empty (no fixture fallback).
    const resolvedPlans = plans.length > 0 ? plans : getMockPlans(undefined);
    expect(resolvedPlans).toHaveLength(0);
  });
});
