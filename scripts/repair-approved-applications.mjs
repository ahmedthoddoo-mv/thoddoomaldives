#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";

const productionProjectRef = "gmalzloyjsalsvtczbbt";
const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const valueAfter = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};

if (has("--help")) {
  console.log(`Usage:
  node --env-file=.env.local scripts/repair-approved-applications.mjs --application <uuid>
  node --env-file=.env.local scripts/repair-approved-applications.mjs --all

Dry-run is the default. Writes require:
  --apply --confirm-project-ref ${productionProjectRef} --approved-by-user-id <admin-auth-uuid>`);
  process.exit(0);
}

const applicationId = valueAfter("--application");
const scanAll = has("--all");
const apply = has("--apply");
const confirmedRef = valueAfter("--confirm-project-ref");
const approvedByUserId = valueAfter("--approved-by-user-id");

if ((!applicationId && !scanAll) || (applicationId && scanAll)) {
  throw new Error("Choose exactly one of --application <uuid> or --all.");
}
if (apply && confirmedRef !== productionProjectRef) {
  throw new Error(`Production writes require --confirm-project-ref ${productionProjectRef}.`);
}
if (apply && !approvedByUserId) {
  throw new Error("Writes require --approved-by-user-id <admin auth UUID>.");
}
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Supabase URL and server-only service-role key are required.");
}

const projectRef = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
if (apply && projectRef === productionProjectRef && confirmedRef !== productionProjectRef) {
  throw new Error("Production project confirmation is missing.");
}

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

let query = db.from("partner_applications")
  .select("id, application_reference, business_name, business_type, status, partner_id, email, metadata")
  .eq("status", "approved");
query = applicationId ? query.eq("id", applicationId) : query.or("partner_id.is.null,property_id.is.null");
const { data: applications, error } = await query.order("submitted_at");
if (error) throw error;
if (!applications?.length) {
  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", applications: [], message: "No matching approved applications." }, null, 2));
  process.exit(0);
}

const reports = [];
for (const application of applications) {
  const [partnerResult, propertyResult, priceResult, serviceResult, mediaResult, invitationResult] = await Promise.all([
    application.partner_id
      ? db.from("partners").select("id, business_name, slug").eq("id", application.partner_id).maybeSingle()
      : db.from("partners").select("id, business_name, slug").eq("email", application.email).ilike("business_name", application.business_name).limit(1).maybeSingle(),
    application.partner_id
      ? db.from("properties").select("id, name, slug, publication_status").eq("partner_id", application.partner_id).ilike("name", application.business_name).limit(1).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    db.from("partner_application_prices").select("id, item_name, price, currency, unit, active").eq("application_id", application.id),
    db.from("partner_application_services").select("id, title").eq("application_id", application.id),
    db.from("partner_application_media").select("id, media_type, status").eq("application_id", application.id),
    db.from("partner_account_invitations").select("id, status").eq("application_id", application.id).maybeSingle()
  ]);

  const accommodation = ["guesthouse", "hotel"].includes(application.business_type);
  const report = {
    application: { id: application.id, reference: application.application_reference, business: application.business_name },
    matchedPartner: partnerResult.data ?? null,
    proposedPartner: partnerResult.data ? null : { businessName: application.business_name, category: application.business_type },
    matchedProperty: propertyResult.data ?? null,
    proposedProperty: accommodation && !propertyResult.data ? { name: application.business_name, publicationStatus: "draft" } : null,
    roomChanges: accommodation
      ? (priceResult.data ?? []).filter((row) => row.active && row.unit === "per night").map((row) => ({
          source: row.id, name: row.item_name, price: row.price && row.price > 0 ? `${row.currency} ${row.price}` : "unknown"
        }))
      : [],
    serviceChanges: [
      ...(priceResult.data ?? []).filter((row) => row.active && row.unit !== "per night").map((row) => row.item_name),
      ...(serviceResult.data ?? []).map((row) => `structured:${row.title}`)
    ],
    mediaChanges: (mediaResult.data ?? []).filter((row) => ["logo", "cover", "hero", "gallery", "room"].includes(row.media_type)).length,
    invitationChanges: invitationResult.data ? "no duplicate; existing invitation retained" : "create one preview invitation",
    skippedValues: (priceResult.data ?? []).filter((row) => !row.active).map((row) => row.item_name),
    warnings: accommodation && !(priceResult.data ?? []).some((row) => row.price && row.price > 0)
      ? ["No positive approved room price; price remains unknown."]
      : []
  };

  if (apply) {
    const { data: adminUser, error: adminUserError } = await db
      .from("admin_users")
      .select("auth_user_id")
      .eq("auth_user_id", approvedByUserId)
      .eq("is_active", true)
      .maybeSingle();
    if (adminUserError || !adminUser) {
      throw new Error("The supplied approval actor is not an active administrator.");
    }
    const { data: approval, error: approvalError } = await db.rpc("approve_partner_application", {
      application_uuid: application.id,
      reviewer_user_id: approvedByUserId,
      reviewer_name: "Approved application repair",
      publish_listing: propertyResult.data?.publication_status === "published",
      review_note: "Idempotent approved-application repair"
    });
    if (approvalError) throw new Error(`Repair failed for ${application.id}: ${approvalError.message}`);
    report.applied = approval;
  }
  reports.push(report);
}

console.log(JSON.stringify({
  mode: apply ? "apply" : "dry-run",
  projectRef,
  reports
}, null, 2));
