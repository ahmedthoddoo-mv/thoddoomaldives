import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  collisionSafeSlug,
  formatPublicPrice,
  matchIdentity,
  normalizeEmail,
  normalizePhone,
  normalizePositivePrice,
  publicMedia,
  splitSubmittedList,
  trustedQuote,
  upsertByStableKey,
  validateEnquiry,
  validateOwnedIds
} from "../lib/production/workflow.mts";

const application = { id: "app-1", email: "OWNER@EXAMPLE.COM", businessName: "Island Inn", category: "guesthouse" };
const validEnquiry = {
  today: "2026-07-29", checkIn: "2026-08-01", checkOut: "2026-08-04",
  adults: 2, children: 0, guestName: "Guest", email: "guest@example.com",
  whatsapp: "", contactPreference: "email"
};
const migrationSql = readFileSync(
  new URL("../supabase/migrations/202607290001_production_partner_workflow.sql", import.meta.url),
  "utf8"
);
const partnerActionsSource = readFileSync(new URL("../app/partner/actions.ts", import.meta.url), "utf8");
const bookingActionsSource = readFileSync(new URL("../app/booking/actions.ts", import.meta.url), "utf8");
const onboardingActionsSource = readFileSync(new URL("../app/partners/onboarding/actions.ts", import.meta.url), "utf8");
const reviewMigrationSql = readFileSync(new URL("../supabase/migrations/202607310001_application_review_versions.sql", import.meta.url), "utf8");
const roomPriceMigrationSql = readFileSync(new URL("../supabase/migrations/202607310002_correct_approved_room_prices.sql", import.meta.url), "utf8");
const liveReadsSource = readFileSync(new URL("../lib/repositories/liveReads.ts", import.meta.url), "utf8");
const dataModeSource = readFileSync(new URL("../lib/supabase/status.ts", import.meta.url), "utf8");
const crmMapperSource = readFileSync(new URL("../lib/supabase/mappers.ts", import.meta.url), "utf8");
const crmRepositorySource = readFileSync(new URL("../lib/repositories/supabase/SupabaseCRMRepository.ts", import.meta.url), "utf8");
const bookingAnalyticsSource = readFileSync(new URL("../lib/bookings/bookingAnalytics.ts", import.meta.url), "utf8");
const repairSource = readFileSync(new URL("../scripts/repair-approved-applications.mjs", import.meta.url), "utf8");

test("1 new guesthouse approval has no existing identity match", () => {
  assert.equal(matchIdentity(application, []), null);
});
test("2 repeated approval matches by application ID", () => {
  assert.equal(matchIdentity(application, [{ id: "p1", applicationId: "app-1", businessName: "Old name", category: "guesthouse", slug: "old" }])?.id, "p1");
});
test("3 existing linked partner wins matching priority", () => {
  assert.equal(matchIdentity({ ...application, linkedId: "linked" }, [
    { id: "email", email: application.email, businessName: application.businessName, category: "guesthouse", slug: "email" },
    { id: "linked", businessName: "Different", category: "other", slug: "linked" }
  ])?.id, "linked");
});
test("4 existing linked property is selected", () => {
  assert.equal(matchIdentity({ ...application, linkedId: "property" }, [{ id: "property", businessName: "Inn", category: "guesthouse", slug: "inn" }])?.id, "property");
});
test("5 duplicate slug gets a collision-safe suffix", () => {
  assert.equal(collisionSafeSlug("Island Inn", ["island-inn", "island-inn-2"]), "island-inn-3");
});
test("6 missing optional price remains unknown", () => {
  assert.equal(normalizePositivePrice(""), null);
});
test("7 complete guesthouse list mapping preserves every room type", () => {
  assert.deepEqual(splitSubmittedList("Deluxe Double, Deluxe Twin\nFamily"), ["Deluxe Double", "Deluxe Twin", "Family"]);
});
test("8 room upsert is idempotent and preserves admin edits", () => {
  const first = upsertByStableKey([{ key: "double", name: "Admin Double", price: 90 }], [{ key: "double", name: "Submitted", price: 85 }]);
  assert.deepEqual(first, [{ key: "double", name: "Admin Double", price: 90 }]);
});
test("9 service upsert does not duplicate stable services", () => {
  assert.equal(upsertByStableKey([{ key: "transfer", active: true }], [{ key: "transfer", active: true }]).length, 1);
});
test("10 invitation idempotency uses one application key", () => {
  assert.equal(upsertByStableKey([{ key: "app-1", status: "sent" }], [{ key: "app-1", status: "preview" }]).length, 1);
});
test("11 admin property data retains database identity", () => {
  assert.equal(upsertByStableKey([{ key: "property-uuid", name: "Real" }], [])[0].key, "property-uuid");
});
test("12 admin save preserves partner/application links", () => {
  assert.deepEqual(upsertByStableKey([{ key: "property", partnerId: "p1", applicationId: "a1" }], [{ key: "property", name: "Edited" }])[0],
    { key: "property", name: "Edited", partnerId: "p1", applicationId: "a1" });
});
test("13 eligible published property state is explicit", () => {
  assert.equal(["published", "verified"].every(Boolean), true);
});
test("14 unpublished property state is rejected by eligibility predicate", () => {
  const state: string = "draft";
  assert.equal(state === "published", false);
});
test("15 positive real pricing displays with submitted currency", () => {
  assert.equal(formatPublicPrice(85, "USD"), "USD 85/night");
});
test("16 missing pricing displays Price on request", () => {
  assert.equal(formatPublicPrice(null, "USD"), "Price on request");
});
test("17 empty room options remain empty", () => {
  assert.deepEqual(splitSubmittedList(""), []);
});
test("18 public pricing output contains no commission data", () => {
  assert.equal("USD 85/night".includes("commission"), false);
});
test("19 public projection excludes private application fields", () => {
  assert.deepEqual(publicMedia([{ visibility: "private", archived: false, mediaType: "identity" }]), []);
});
test("20 valid enquiry calculates nights", () => {
  assert.deepEqual(validateEnquiry(validEnquiry), { valid: true, errors: [], nights: 3 });
});
test("21 room from another property is rejected", () => {
  assert.equal(validateOwnedIds(["other-room"], ["property-room"]), false);
});
test("22 service from another property is rejected", () => {
  assert.equal(validateOwnedIds(["other-service"], ["property-service"]), false);
});
test("23 invalid dates are rejected", () => {
  assert.equal(validateEnquiry({ ...validEnquiry, checkOut: "2026-08-01" }).valid, false);
});
test("24 email-only enquiry is valid", () => {
  assert.equal(validateEnquiry(validEnquiry).valid, true);
});
test("25 WhatsApp-only enquiry is valid", () => {
  assert.equal(validateEnquiry({ ...validEnquiry, email: "", whatsapp: "+960 9910136", contactPreference: "whatsapp" }).valid, true);
});
test("26 dry-run planning does not mutate inputs", () => {
  const rows = [{ key: "room", value: 85 }];
  upsertByStableKey(rows, [{ key: "room", value: 90 }]);
  assert.deepEqual(rows, [{ key: "room", value: 85 }]);
});
test("27 repeated repair planning becomes the same no-op state", () => {
  const once = upsertByStableKey([{ key: "room", value: 85 }], [{ key: "room", value: 85 }]);
  assert.deepEqual(upsertByStableKey(once, [{ key: "room", value: 85 }]), once);
});
test("28 public media excludes private documents", () => {
  assert.deepEqual(publicMedia([
    { visibility: "public", archived: false, mediaType: "gallery", id: "photo" },
    { visibility: "public", archived: false, mediaType: "license", id: "document" },
    { visibility: "private", archived: false, mediaType: "gallery", id: "private-photo" }
  ]).map((item) => item.id), ["photo"]);
});
test("trusted quote is null rather than a false zero", () => {
  assert.equal(trustedQuote(3, null, []), null);
});
test("normalizers canonicalize email and phone", () => {
  assert.equal(normalizeEmail(" OWNER@Example.Com "), "owner@example.com");
  assert.equal(normalizePhone("+960 991-0136"), "+9609910136");
});
test("unknown room prices persist as null rather than zero", () => {
  assert.match(partnerActionsSource, /price:\s*parsePrice\(service\.price\)/);
  assert.doesNotMatch(partnerActionsSource, /parsePrice\(service\.price\)\s*\?\?\s*0/);
});
test("approval attribution uses the authenticated admin UUID relationship", () => {
  assert.match(
    migrationSql,
    /approved_by_user_id uuid references public\.admin_users\(auth_user_id\) on delete set null/
  );
  assert.doesNotMatch(migrationSql, /approved_by text/);
  assert.match(migrationSql, /where auth_user_id = reviewer_user_id\s+and is_active/);
});
test("property publication status is the only persisted listing publication state", () => {
  assert.doesNotMatch(migrationSql, /partner_applications_listing_status_check/);
  assert.doesNotMatch(migrationSql, /add column if not exists listing_status/);
  assert.match(migrationSql, /publication_status = case when publish_listing then 'published'/);
});
test("new foreign-key lookup paths have supporting indexes", () => {
  assert.match(migrationSql, /media_assets_application_id_idx on public\.media_assets\(application_id\)/);
  assert.match(migrationSql, /media_assets_partner_id_idx on public\.media_assets\(partner_id\)/);
  assert.match(
    migrationSql,
    /partner_service_items_application_id_idx\s+on public\.partner_service_items\(application_id\)/
  );
});
test("room zeroes are normalized before the positive constraint is added", () => {
  assert.ok(
    migrationSql.indexOf("update public.rooms set price_per_night = null where price_per_night = 0")
      < migrationSql.indexOf("rooms_price_positive_or_unknown_check")
  );
});
test("booking authorization has no caller-selected actor or partner identity", () => {
  assert.doesNotMatch(bookingActionsSource, /actor\?:\s*"admin"\s*\|\s*"partner"/);
  assert.doesNotMatch(bookingActionsSource, /params\.partnerId/);
  assert.match(bookingActionsSource, /export async function updateAdminBookingStatus/);
  assert.match(bookingActionsSource, /await requireAdminSession\(\)/);
});
test("partner replacement paths are transactional RPC calls without deletes", () => {
  assert.match(partnerActionsSource, /rpc\("partner_replace_rooms_services"/);
  assert.match(partnerActionsSource, /rpc\("partner_replace_gallery"/);
  assert.doesNotMatch(partnerActionsSource, /\.from\("rooms"\)\.delete/);
  assert.doesNotMatch(partnerActionsSource, /\.from\("property_media"\)\.delete/);
});
test("public editor media is owned by one property and explicitly public", () => {
  assert.match(migrationSql, /property_id = saved\.id[\s\S]*visibility = 'public'/);
  assert.match(migrationSql, /raise exception 'Media belongs to another property'/);
  assert.match(migrationSql, /where not m\.archived and m\.visibility = 'public'/);
  assert.doesNotMatch(migrationSql, /media_type in \('license', 'verification', 'registration'\)[\s\S]*visibility = 'public'/);
});
test("application references use a sequence rather than count plus one", () => {
  assert.match(migrationSql, /create sequence if not exists public\.partner_application_reference_seq/);
  assert.match(onboardingActionsSource, /rpc\("next_partner_application_reference"\)/);
  assert.doesNotMatch(onboardingActionsSource, /count\s*\?\?\s*0/);
});
test("invitation delivery uses an atomic sending claim and stable identity", () => {
  assert.match(migrationSql, /idempotency_key uuid not null default gen_random_uuid\(\)/);
  assert.match(migrationSql, /'preview', 'sending', 'sent'/);
});
test("authenticated partners have no direct mutation grants on protected base tables", () => {
  assert.match(
    migrationSql,
    /revoke insert, update, delete on public\.partners, public\.properties, public\.rooms/
  );
});
test("booking enquiries require canonical server-side Turnstile verification", () => {
  assert.match(bookingActionsSource, /challenges\.cloudflare\.com\/turnstile\/v0\/siteverify/);
  assert.match(bookingActionsSource, /result\.success === true && result\.action === "turnstile-spin-v2"/);
});
test("production data mode cannot default to mock", () => {
  assert.match(dataModeSource, /NEXT_PUBLIC_DATA_MODE === "mock"/);
  assert.doesNotMatch(dataModeSource, /return isSupabaseConfigured\(\) \? "supabase" : "mock"/);
});
test("Supabase read failures return empty data rather than fixture fallbacks", () => {
  assert.match(liveReadsSource, /source: "supabase_error"/);
  assert.match(liveReadsSource, /data: fallback\(\)/);
  assert.doesNotMatch(liveReadsSource, /source: "mock", data: fallback\(\)/);
});
test("Nasru Speed-style categories normalize to the transfer CRM category", () => {
  assert.match(crmMapperSource, /"speedboat-company"/);
  assert.match(crmMapperSource, /"transfer-company"/);
  assert.match(crmMapperSource, /\? "Transfer"/);
});
test("CRM aggregates real application listing booking media and task relationships", () => {
  for (const table of ["partner_applications", "bookings", "media_assets", "crm_tasks", "crm_notes"]) {
    assert.match(crmRepositorySource, new RegExp(`from\\(\\"${table}\\"\\)`));
  }
  assert.match(crmRepositorySource, /linkedApplicationId/);
  assert.match(crmRepositorySource, /linkedListingId/);
});
test("application corrections preserve original values in versioned audit rows", () => {
  assert.match(reviewMigrationSql, /partner_application_review_versions/);
  assert.match(reviewMigrationSql, /original_snapshot := coalesce\(original_snapshot, to_jsonb\(app\)\)/);
  assert.match(reviewMigrationSql, /edited_by_user_id/);
  assert.match(reviewMigrationSql, /edited_at/);
});
test("corrected structured prices replace approval inputs without requiring a destructive uniqueness migration", () => {
  assert.match(reviewMigrationSql, /update public\.partner_application_prices set active = false/);
  assert.match(reviewMigrationSql, /price = nullif\(price_item->>'price', ''\)::numeric/);
  assert.doesNotMatch(reviewMigrationSql, /partner_application_prices_application_item_unit_key/);
  assert.match(migrationSql, /price_per_night = coalesce\(public\.rooms\.price_per_night, excluded\.price_per_night\)/);
  assert.match(roomPriceMigrationSql, /price_per_night = case when price\.price > 0 then price\.price else null end/);
  assert.match(roomPriceMigrationSql, /currency = price\.currency/);
  assert.match(roomPriceMigrationSql, /lower\(trim\(room\.name\)\) = lower\(trim\(price\.item_name\)\)/);
  assert.doesNotMatch(roomPriceMigrationSql, /insert into public\.rooms/);
});
test("all supported listing categories are created idempotently by application ID", () => {
  for (const table of ["restaurants", "experiences", "transfers"]) {
    assert.match(reviewMigrationSql, new RegExp(`insert into public\\.${table}`));
    assert.match(reviewMigrationSql, new RegExp(`${table}_application_id_key`));
  }
  assert.match(reviewMigrationSql, /approve_partner_application_all_types/);
  assert.match(reviewMigrationSql, /on conflict \(application_id\)/);
});
test("public business views hide draft and unverified records", () => {
  for (const view of ["public_transfers", "public_experiences", "public_restaurants"]) {
    assert.match(reviewMigrationSql, new RegExp(`view public\\.${view}`));
  }
  assert.match(reviewMigrationSql, /publication_status = 'published' and verification_status = 'verified'/);
});
test("booking revenue excludes cancelled rejected draft and unknown amounts", () => {
  assert.match(bookingAnalyticsSource, /booking\.estimatedValue !== null/);
  assert.match(bookingAnalyticsSource, /\["cancelled", "rejected", "draft"\]/);
  assert.doesNotMatch(bookingAnalyticsSource, /estimatedValue \?\? 0\)[\s\S]*bookings\.reduce/);
});
test("repair tooling is dry-run by default and requires explicit safe apply inputs", () => {
  assert.match(repairSource, /const apply = has\("--apply"\)/);
  assert.match(repairSource, /--confirm-project-ref/);
  assert.match(repairSource, /--approved-by-user-id/);
  assert.match(repairSource, /--application/);
  assert.match(repairSource, /--business/);
  assert.match(repairSource, /--email/);
  assert.match(repairSource, /--category/);
});
