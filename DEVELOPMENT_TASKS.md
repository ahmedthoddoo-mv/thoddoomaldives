# iThoddoo Maldives — Development Tasks

## Current Status

- Next.js 16 project
- Supabase connected
- Cloudflare Workers deployment configured
- Admin portal available
- Partner onboarding available
- Partner portal foundation available
- Dynamic business categories partly implemented
- Production build currently passes

---

## PRIORITY 1 — Onboarding Label Fix

Status: Pending

Problem:

Selecting Watersports, Excursion Operator, Restaurant, Transfer, or other business types still shows some accommodation-oriented shared labels.

Examples:

- Services offered
- Number of rooms/items/services
- Price range
- Example: USD 80–140 per night

Required behavior:

### Guesthouse / Hotel

- Services label: Rooms and accommodation offered
- Quantity label: Number of rooms
- Price label: Room price range
- Price example: USD 80–140 per night

### Watersports / Excursion Operator / Dive Center

- Services label: Activities offered
- Services example: Manta snorkeling, sandbank, fishing, sunset cruise
- Quantity label: Maximum guests per trip
- Price label: Starting price
- Price example: USD 35 per person

### Restaurant / Cafe

- Services label: Cuisine and services
- Quantity label: Seating capacity
- Price label: Average price per person

### Speedboat / Ferry / Transfer

- Services label: Routes and transfer services
- Quantity label: Vessel or vehicle capacity
- Price label: Starting fare

### Shop

- Services label: Product categories
- Quantity label: Number of product categories
- Price label: Product price range

Requirements:

- Use the existing canonical business-type mapping.
- Do not change the database schema.
- Do not redesign unrelated sections.
- Preserve existing form values and validation.
- Run npm run build.
- Do not commit or push automatically.

---

## PRIORITY 2 — Verify Live Onboarding

Status: Pending

Test:

- Guesthouse shows accommodation fields.
- Watersports shows activity fields.
- Excursion Operator shows activity fields.
- Restaurant shows restaurant fields.
- Transfer shows routes and schedules.
- No unrelated room fields appear.
- Required documents change by business type.
- Application saves to Supabase.
- Application appears in Admin Applications.
- WhatsApp opens +9609142538.

---

## PRIORITY 3 — Production Data Completion

Status: Pending

Replace remaining mock/static data in Supabase mode:

- Admin CRM partners
- Admin CRM tasks
- Admin CRM notes
- Admin media library
- Admin property dashboard
- Partner calendar
- Partner analytics
- Partner membership
- Partner pricing plans
- Partner gallery defaults
- Partner application status

Rules:

- Admin pages must not silently show mock data in production.
- Show a clear live-data error when Supabase is unavailable.
- Keep explicit mock mode for development.

---

## PRIORITY 4 — Security

Status: Pending

- Strengthen partner ownership RLS.
- Ensure partners access only their own records.
- Keep service-role keys server-only.
- Rotate any Supabase secret that appeared in a generated local build file.
- Verify .open-next, .next, .env.local, and .dev.vars are ignored.
- Review document-storage privacy.

---

## PRIORITY 5 — Business Verification

Status: Pending

- Guesthouse tourism licence required.
- Business registration required.
- Owner or authorized representative ID required.
- GST and Green Tax records where applicable.
- Dynamic documents for watersports, restaurants, and transfers.
- Admin can approve, reject, or request changes.
- Owners can replace missing/rejected documents.
- Documents stored privately.

---

## PRIORITY 6 — Booking Engine

Status: Planned

- Real availability calendar
- Room and service booking requests
- Partner approval/rejection
- Guest confirmation
- Booking status tracking
- Price calculation
- Admin booking management
- TGST and Green Tax-ready booking records

---

## PRIORITY 7 — Billing and Membership

Status: Planned

- Membership plans
- Partner invoices
- Invoice numbering
- PDF invoices
- Paid, pending, and overdue statuses
- Manual bank-transfer confirmation
- Renewal reminders
- Membership expiry handling
- Commission option

---

## Working Rules

Before editing:

1. Run git status.
2. Confirm the working branch.
3. Run npm run build.

After editing:

1. Run npm run build.
2. Review git diff --stat.
3. Test affected routes locally.
4. Do not commit or push until approved.

Never commit:

- .env.local
- .dev.vars
- .next
- .open-next
- Supabase secret keys
- Cloudflare secrets
