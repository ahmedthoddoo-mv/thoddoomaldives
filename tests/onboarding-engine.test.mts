import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  buildSlug,
  getBusinessOnboardingDefinition,
  getBusinessOnboardingSteps,
  getDefaultBusinessOnboardingValues,
  parseGuesthouseRooms,
  serializeGuesthouseRooms,
  validateBusinessOnboardingStep
} from "../lib/onboarding/businessOnboardingDefinitions.ts";

const migrationSql = readFileSync(new URL("../supabase/migrations/20260809140000_business_onboarding_engine.sql", import.meta.url), "utf8");
const wizardSource = readFileSync(new URL("../components/onboarding/BusinessOnboardingWizard.tsx", import.meta.url), "utf8");
const serverSource = readFileSync(new URL("../lib/onboarding/server.ts", import.meta.url), "utf8");
const adminOnboardingClientSource = readFileSync(new URL("../components/onboarding/AdminBusinessOnboardingClient.tsx", import.meta.url), "utf8");
const adminDraftPageSource = readFileSync(new URL("../app/admin/businesses/[id]/onboarding/page.tsx", import.meta.url), "utf8");
const adminPropertyNewPageSource = readFileSync(new URL("../app/admin/properties/new/page.tsx", import.meta.url), "utf8");

test("restaurant onboarding config exposes shared and category-specific steps", () => {
  const definition = getBusinessOnboardingDefinition("restaurant");
  assert.equal(definition.label, "Restaurant");
  assert.ok(definition.commonSteps.some((step) => step.id === "business"));
  assert.ok(definition.categorySteps.some((step) => step.id === "restaurant-module"));
});

test("default values and slug generation support draft-based onboarding", () => {
  const values = getDefaultBusinessOnboardingValues("restaurant");
  assert.equal(values.businessType, "restaurant");
  assert.equal(buildSlug("Food Land"), "food-land");
  assert.deepEqual(validateBusinessOnboardingStep(getBusinessOnboardingDefinition("restaurant"), values, "business"), ["Business name is required.", "A slug is required."]);
});

test("onboarding migrations include draft persistence and service-role policies", () => {
  assert.match(migrationSql, /create table if not exists public\.business_onboarding_drafts/);
  assert.match(migrationSql, /owner_type text not null check \(owner_type in \('admin','partner'\)\)/);
  assert.match(migrationSql, /drop policy if exists business_onboarding_drafts_service_role_all[\s\S]*on public\.business_onboarding_drafts/);
  assert.match(migrationSql, /create policy business_onboarding_drafts_service_role_all/);
});

test("wizard exposes save draft and publish controls", () => {
  assert.match(wizardSource, /Save draft/);
  assert.match(wizardSource, /Publish/);
  assert.match(serverSource, /saveBusinessOnboardingDraft/);
  assert.match(serverSource, /publishBusinessOnboardingDraft/);
});

test("guesthouse onboarding config loads reusable guesthouse module steps", () => {
  const definition = getBusinessOnboardingDefinition("guesthouse");
  const stepIds = definition.categorySteps.map((step) => step.id);
  const orderedSteps = getBusinessOnboardingSteps("guesthouse").map((step) => step.id);
  assert.equal(definition.label, "Guesthouse");
  assert.ok(stepIds.includes("property-details"));
  assert.ok(stepIds.includes("rooms"));
  assert.ok(stepIds.includes("amenities-facilities"));
  assert.ok(stepIds.includes("policies-booking"));
  assert.ok(stepIds.includes("publish"));
  assert.deepEqual(orderedSteps, ["business", "contact", "location", "property-details", "rooms", "amenities-facilities", "media", "policies-booking", "membership", "review", "publish"]);
});

test("guesthouse validation enforces required rooms and contact/location requirements", () => {
  const definition = getBusinessOnboardingDefinition("guesthouse");
  const values = getDefaultBusinessOnboardingValues("guesthouse");

  const propertyIssues = validateBusinessOnboardingStep(definition, values, "property-details");
  const roomIssues = validateBusinessOnboardingStep(definition, values, "rooms");
  const policyIssues = validateBusinessOnboardingStep(definition, values, "policies-booking");

  assert.ok(propertyIssues.some((issue) => issue.includes("Property type")));
  assert.ok(roomIssues.some((issue) => issue.includes("Add at least one room")));
  assert.ok(policyIssues.some((issue) => issue.includes("WhatsApp")));
});

test("category switch uses the active business type and not the initial prop", () => {
  assert.match(wizardSource, /const activeBusinessType = String\(\(values\.businessType \?\? initialBusinessType\) \|\| "restaurant"\)/);
  assert.match(wizardSource, /onChange=\{\(event\) => changeBusinessType\(event\.target\.value\)\}/);
});

test("guesthouse workflow copy has no restaurant menu text", () => {
  assert.match(wizardSource, /Create a new guesthouse listing/);
  assert.match(wizardSource, /rooms, amenities, photos, booking contacts, and policies through one guided flow/);
  assert.match(wizardSource, /activeBusinessType === "restaurant" \? \(/);
  assert.match(wizardSource, /Show original source menu publicly/);
  assert.match(wizardSource, /case "rooms":/);
  assert.match(wizardSource, /case "amenities-facilities":/);
  assert.match(wizardSource, /case "policies-booking":/);
});

test("guesthouse publish uses canonical property persistence", () => {
  assert.match(serverSource, /if \(normalizedBusinessType === "guesthouse"\)/);
  assert.match(serverSource, /rpc\("admin_save_property"/);
  assert.match(serverSource, /from\("rooms"\)\.select\("id, name"\)\.eq\("property_id", listingId\)/);
});

test("draft resume preserves guesthouse business type and step", () => {
  assert.match(serverSource, /business_type: normalizedBusinessType/);
  assert.match(serverSource, /current_step: input\.currentStep \?\? "business"/);
  assert.match(wizardSource, /initialStepId/);
});

test("new admin onboarding starts with category selection for implemented modules", () => {
  assert.match(adminOnboardingClientSource, /What type of business are you adding\?/);
  assert.match(adminOnboardingClientSource, /implementedTypes = \["guesthouse", "restaurant"\]/);
  assert.match(adminOnboardingClientSource, /router\.replace\(`\/admin\/businesses\/new\?type=\$\{typeOption\}`\)/);
});

test("legacy add property route redirects into guesthouse onboarding", () => {
  assert.match(adminPropertyNewPageSource, /redirect\("\/admin\/businesses\/new\?type=guesthouse"\)/);
});

test("parseGuesthouseRooms preserves new rooms with empty name and price", () => {
  // A freshly-added room has empty name and basePrice. It must NOT be filtered out
  // or the Add Room button will appear to do nothing.
  const blankRoom = {
    id: "room-abc123",
    name: "",
    description: "",
    maxGuests: 2,
    bedType: "",
    quantity: 1,
    basePrice: "",
    gallery: [],
    amenities: [],
    featured: true
  };
  const serialized = serializeGuesthouseRooms([blankRoom]);
  const parsed = parseGuesthouseRooms(serialized);
  assert.equal(parsed.length, 1, "blank room must survive round-trip through serialize/parse");
  assert.equal(parsed[0]!.id, blankRoom.id);
  assert.equal(parsed[0]!.name, "");
  assert.equal(parsed[0]!.basePrice, "");
});

test("parseGuesthouseRooms preserves multiple rooms including partially-filled ones", () => {
  const rooms = [
    { id: "r1", name: "Deluxe Double Room", description: "", maxGuests: 2, bedType: "King", quantity: 1, basePrice: "USD 85", gallery: [], amenities: [], featured: true },
    { id: "r2", name: "", description: "", maxGuests: 2, bedType: "", quantity: 1, basePrice: "", gallery: [], amenities: [], featured: false }
  ];
  const parsed = parseGuesthouseRooms(serializeGuesthouseRooms(rooms));
  assert.equal(parsed.length, 2, "both rooms must survive — the blank one is in-progress, not invalid");
  assert.equal(parsed[0]!.name, "Deluxe Double Room");
  assert.equal(parsed[1]!.name, "");
});

test("rooms-step validation blocks Continue when rooms list is empty", () => {
  const definition = getBusinessOnboardingDefinition("guesthouse");
  const values = { ...getDefaultBusinessOnboardingValues("guesthouse"), guesthouseRooms: "[]" };
  const errors = validateBusinessOnboardingStep(definition, values, "rooms");
  assert.ok(errors.some((e) => e.includes("Add at least one room")));
});

test("rooms-step validation blocks Continue when any room is missing name or price", () => {
  const definition = getBusinessOnboardingDefinition("guesthouse");
  const blankRoom = serializeGuesthouseRooms([
    { id: "r1", name: "", description: "", maxGuests: 2, bedType: "", quantity: 1, basePrice: "", gallery: [], amenities: [], featured: true }
  ]);
  const values = { ...getDefaultBusinessOnboardingValues("guesthouse"), guesthouseRooms: blankRoom };
  const errors = validateBusinessOnboardingStep(definition, values, "rooms");
  assert.ok(errors.some((e) => e.includes("Every room requires a name")));
  assert.ok(errors.some((e) => e.includes("Every room requires a base price")));
});

test("rooms-step validation passes when all rooms have name and price", () => {
  const definition = getBusinessOnboardingDefinition("guesthouse");
  const rooms = serializeGuesthouseRooms([
    { id: "r1", name: "Deluxe Double", description: "", maxGuests: 2, bedType: "", quantity: 1, basePrice: "USD 85", gallery: [], amenities: [], featured: true },
    { id: "r2", name: "Deluxe Triple", description: "", maxGuests: 3, bedType: "", quantity: 1, basePrice: "USD 120", gallery: [], amenities: [], featured: false }
  ]);
  const values = { ...getDefaultBusinessOnboardingValues("guesthouse"), guesthouseRooms: rooms };
  const errors = validateBusinessOnboardingStep(definition, values, "rooms");
  assert.equal(errors.length, 0, `unexpected validation errors: ${errors.join(", ")}`);
});

test("save draft returns a draft id and resume path", () => {
  assert.match(serverSource, /return \{ ok: true as const, draftId: savedId, resumePath, message: "Draft saved\." \}/);
  assert.match(serverSource, /const resumePath = input\.ownerType === "admin"/);
});

test("wizard renders a clickable draft resume link after save", () => {
  assert.match(wizardSource, /Open saved draft/);
  assert.match(wizardSource, /<Link/);
  assert.match(wizardSource, /window\.history\.replaceState/);
});

test("draft resume page restores guesthouse business type and step", () => {
  assert.match(adminDraftPageSource, /businessType=\{typedDraft\?\.businessType \?\? "restaurant"\}/);
  assert.match(adminDraftPageSource, /initialStepId=\{typedDraft\?\.currentStep\}/);
});
