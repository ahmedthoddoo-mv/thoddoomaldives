# Supabase Setup for Project Atlas

Project Atlas is prepared for Supabase, but the application still defaults to mock data. Ahmed should only switch to Supabase mode after the project, keys, migrations, and seed data are confirmed.

No secrets belong in Git. Keep real keys in `.env.local` locally and in protected deployment environment variables.

## Ahmed's Manual Steps

Follow these steps in order.

1. Create a Supabase project
   - Go to https://supabase.com and sign in.
   - Create a new project for iThoddoo Maldives.
   - Choose a strong database password.
   - Save the password securely outside the codebase.

2. Copy the Supabase values
   - Open the Supabase project dashboard.
   - Go to Project Settings, then API.
   - Copy the Project URL.
   - Copy the anon public key.
   - Copy the service role key.
   - Never paste the service role key into client-side code.

3. Create `.env.local`
   - In the project root, create or edit `.env.local`.
   - Use this shape:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_DATA_MODE=mock
ADMIN_DEMO_PASSWORD=your-demo-admin-password
```

`ADMIN_DEMO_PASSWORD` is server-only. Do not prefix it with `NEXT_PUBLIC_`, because public variables are bundled into browser JavaScript.

4. Log in to Supabase CLI

```bash
npx supabase login
```

or:

```bash
npm run supabase:login
```

5. Link the project
   - Find the project ref in Supabase Project Settings.
   - It looks like a short random string.

```bash
npx supabase link --project-ref your-project-ref
```

or:

```bash
npm run supabase:link -- --project-ref your-project-ref
```

6. Review migrations before pushing

```bash
npm run supabase:migrations
```

Migration file:

```text
supabase/migrations/202607110001_project_atlas_foundation.sql
```

7. Push the database schema

```bash
npm run supabase:push
```

To push migrations and include the configured default seed file in one CLI command:

```bash
npm run supabase:push:seed
```

This reads `supabase/config.toml`, where `[db.seed].sql_paths` points to `./seed.sql`.

8. Preview and seed demo data

For local Supabase development:

```bash
npm run supabase:seed
```

For hosted Supabase, do not run a reset command. First preview the seed file locally:

```bash
less supabase/seed.sql
```

Then open the Supabase SQL Editor and run the full contents of:

```text
supabase/seed.sql
```

Use the SQL Editor for hosted seed data so the remote database is not reset by mistake.

9. Verify seed data

Run the full contents of this file in Supabase SQL Editor:

```text
supabase/seed_verify.sql
```

It checks expected row counts, duplicate slugs, and public property read readiness.

10. Roll back demo seed data if needed

Run the full contents of this file in Supabase SQL Editor:

```text
supabase/seed_rollback_demo.sql
```

It removes only known Project Atlas demo seed rows. It does not drop schema and leaves canonical membership plans in place.

11. Verify tables manually

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

Expected core tables:
- `membership_plans`
- `partners`
- `properties`
- `rooms`
- `guests`
- `bookings`
- `media_assets`
- `restaurants`
- `experiences`
- `transfers`
- `crm_tasks`
- `crm_notes`

10. Test mock mode

Keep this in `.env.local`:

```bash
NEXT_PUBLIC_DATA_MODE=mock
```

Then run:

```bash
npm run build
```

11. Test Supabase mode

After migrations and seed data are confirmed, change:

```bash
NEXT_PUBLIC_DATA_MODE=supabase
```

Then run:

```bash
npm run build
```

Check:
- `/stay`
- `/stay/thoddoo-sun-sky-inn`
- `/admin`

When opening `/admin`, enter the `ADMIN_DEMO_PASSWORD`. A successful login creates an HttpOnly, SameSite demo session cookie scoped to `/admin`. Use the dashboard logout button to clear it.

12. Configure Cloudflare

In Cloudflare deployment settings, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_DATA_MODE`

Add these only as protected server-side secrets:
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_DEMO_PASSWORD`

Never expose the service role key or admin demo password in browser code. `ADMIN_DEMO_PASSWORD` must not use the `NEXT_PUBLIC_` prefix.

13. Roll back to mock mode

If Supabase is unstable, set:

```bash
NEXT_PUBLIC_DATA_MODE=mock
```

Redeploy. The website will use mock repositories again.

## Environment Template

`.env.example` intentionally contains placeholders only:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_DATA_MODE=mock
ADMIN_DEMO_PASSWORD=
```

`.env.local` is ignored by Git through `.env*`.

## Migration Summary

The foundation migration creates:
- Membership plans
- Partners
- Properties
- Rooms
- Guests
- Bookings
- Media assets
- Restaurants
- Experiences
- Transfers
- CRM tasks
- CRM notes
- Property/media relationship tables
- Property/experience relationship tables
- Property/transfer relationship tables
- Partner/media relationship tables

The migration also adds:
- Foreign keys
- Unique slugs
- Unique room names per property
- Publication status checks
- Verification status checks
- Booking status checks
- Payment status checks
- Timestamp columns
- Updated-at triggers
- Public read indexes
- CRM and booking indexes
- Row Level Security

## RLS Policy Summary

Public anonymous users can read:
- Active membership plans
- Published properties
- Active rooms for published properties
- Published restaurants
- Published experiences
- Published transfers
- Media assets linked to published properties

Anonymous users cannot:
- Insert records
- Update records
- Delete records
- Read guests
- Read bookings
- Read CRM tasks
- Read CRM notes

Service role access:
- Supabase service role bypasses RLS.
- Use service role only from server-side code.
- Do not create public write policies.

## Seed Summary

`supabase/seed.sql` includes:
- 3 membership plans
- 3 partners
- 3 properties
- 6 rooms
- 5 experiences
- 3 restaurants
- 3 transfers
- 5 media assets
- 5 property media links
- 5 property experience links
- 5 property transfer links
- 3 guests
- 3 bookings
- CRM tasks
- CRM notes

Data labels:
- Thoddoo Sun Sky Inn is marked as verified Project Atlas data, with operational fields still needing production confirmation.
- Palm Garden Thoddoo is demo data only.
- Coral Wave Residence is demo data only.
- Restaurants, experiences, transfers, guests, bookings, CRM tasks, and CRM notes are demo data unless separately verified later.

Image paths use existing local project assets, including:
- `/images/hero-thoddoo.jpg`
- `/images/homepage/hero-1.jpg`
- `/images/homepage/hero-2.jpg`
- `/images/homepage/hero-3.jpg`
- `/images/homepage/hero-4.jpg`
- `/images/homepage/hero-5.jpg`
- `/images/homepage/hero-6.jpg`

## Repository Provider

The repository provider lives at:

```text
lib/repositories/provider.ts
```

Behavior:
- Mock mode is the default.
- Supabase mode is used only when `NEXT_PUBLIC_DATA_MODE=supabase` and public Supabase variables are configured.
- If variables are missing, the provider falls back to mock mode.

Current read-only Supabase pilot:
- `/stay`
- `/stay/[slug]`

Both routes keep mock fallback.

## Admin Health Check

The Admin Dashboard shows:
- Current data mode
- Supabase configured yes/no
- Database reachable yes/no
- Migration version

It never displays Supabase keys.

## Useful Commands

```bash
npm run supabase:login
npm run supabase:link -- --project-ref your-project-ref
npm run supabase:migrations
npm run supabase:push
npm run supabase:push:seed
npm run supabase:seed
npm run supabase:status
npm run build
```

Hosted Supabase seed workflow:

```text
1. Open supabase/seed.sql locally and review it.
2. Paste supabase/seed.sql into Supabase SQL Editor and run it.
3. Paste supabase/seed_verify.sql into Supabase SQL Editor and run it.
4. If demo seed data must be removed, paste supabase/seed_rollback_demo.sql into Supabase SQL Editor and run it.
```

## Remaining Production Work

Before production launch:
- Replace the temporary admin demo gate with real authentication.
- Add authenticated admin and partner policies.
- Move write actions behind server-side authorization.
- Add backup and migration rollback procedures.
- Regenerate Supabase TypeScript types from the live database.
- Add monitoring for failed Supabase reads.
