import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getApplicationOwnerState } from "../lib/applications/ownerState.ts";

const mappersSource = readFileSync(new URL("../lib/supabase/mappers.ts", import.meta.url), "utf8");

test("application owner state renders linked owner state explicitly", () => {
  const state = getApplicationOwnerState({
    linkedPartnerId: "partner-1",
    linkedPartnerName: "Sun Sky Inn",
    linkedListingId: "property-1",
    ownerInvitationStatus: undefined,
    email: "owner@example.com"
  });

  assert.equal(state.kind, "linked");
  assert.match(state.title, /Partner already linked/);
  assert.match(state.detail, /Sun Sky Inn/);
});

test("application owner state surfaces pending invitations", () => {
  const state = getApplicationOwnerState({
    linkedPartnerId: undefined,
    linkedPartnerName: undefined,
    linkedListingId: undefined,
    ownerInvitationStatus: "pending",
    email: "owner@example.com"
  });

  assert.equal(state.kind, "pending");
  assert.match(state.title, /Invitation pending/);
  assert.match(state.detail, /owner@example.com/);
});

test("media mapper preserves public visibility from business media metadata", () => {
  assert.match(mappersSource, /isPublic: meta\?\.isPublic \?\? asset\.visibility === "public"/);
  assert.match(mappersSource, /rightsStatus: asset\.rights_status === "permission_confirmed" \? "Permission confirmed" : "Needs confirmation"/);
});
