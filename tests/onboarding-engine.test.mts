import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  buildSlug,
  getBusinessOnboardingDefinition,
  getDefaultBusinessOnboardingValues,
  validateBusinessOnboardingStep
} from "../lib/onboarding/businessOnboardingDefinitions.ts";

const migrationSql = readFileSync(new URL("../supabase/migrations/20260809140000_business_onboarding_engine.sql", import.meta.url), "utf8");
const wizardSource = readFileSync(new URL("../components/onboarding/BusinessOnboardingWizard.tsx", import.meta.url), "utf8");
const serverSource = readFileSync(new URL("../lib/onboarding/server.ts", import.meta.url), "utf8");

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
  assert.match(migrationSql, /create policy if not exists business_onboarding_drafts_service_role_all/);
});

test("wizard exposes save draft and publish controls", () => {
  assert.match(wizardSource, /Save draft/);
  assert.match(wizardSource, /Publish/);
  assert.match(serverSource, /saveBusinessOnboardingDraft/);
  assert.match(serverSource, /publishBusinessOnboardingDraft/);
});
