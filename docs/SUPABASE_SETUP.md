# Supabase Setup for Project Atlas

This document prepares iThoddoo Maldives for permanent data storage. The app still defaults to mock data until Supabase is configured and `NEXT_PUBLIC_DATA_MODE=supabase` is set.

## 1. Create a Supabase Project

1. Sign in at https://supabase.com.
2. Create a new project.
3. Choose a strong database password and save it securely.
4. Open Project Settings, then API.
5. Copy the project URL, anon public key, and service role key.

## 2. Environment Variables

Create or update `.env.local` locally. Do not commit `.env.local`.

```bash
NEXT_PUBLIC_DATA_MODE=mock
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_ADMIN_DEMO_PASSWORD=your-demo-admin-password
```

Security notes:
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` can be used by browser code.
- `SUPABASE_SERVICE_ROLE_KEY` must never be imported by client components.
- Service role access should only be used in server-only code after real authentication is added.
- Keep the existing admin demo gate until EPIC-030 replaces it with real auth.

## 3. Run Migrations

Install the Supabase CLI if needed:

```bash
npm install -g supabase
```

Then log in and link the project:

```bash
supabase login
supabase link --project-ref your-project-ref
npm run supabase:link -- --project-ref your-project-ref
npm run supabase:push
```

The migration file is:

```text
supabase/migrations/202607110001_project_atlas_foundation.sql
```

It creates:
- `partners`
- `properties`
- `rooms`
- `bookings`
- `guests`
- `media_assets`
- `restaurants`
- `experiences`
- `transfers`
- `crm_tasks`
- `crm_notes`
- `membership_plans`
- `property_experiences`
- `property_transfers`
- `property_media`
- `partner_media`

## 4. Seed Demo Data

After migrations, seed the database:

```bash
npm run supabase:reset-and-seed
```

or run the SQL from:

```text
supabase/seed.sql
```

The seed is designed to be idempotent where practical and includes demo partners, membership plans, properties, rooms, bookings, experiences, restaurants, transfers, media assets, property media links, CRM tasks, and CRM notes. Image paths use existing project assets such as `/images/hero-thoddoo.jpg`.

## 5. Switch Data Mode

Mock mode is the default:

```bash
NEXT_PUBLIC_DATA_MODE=mock
```

To test Supabase adapters:

```bash
NEXT_PUBLIC_DATA_MODE=supabase
```

In Supabase mode, the published property read pilot is active:
- `/stay` reads published properties from Supabase.
- `/stay/[slug]` reads a single published Supabase property.
- Draft, archived, or suspended properties are not shown publicly.
- If Supabase is not configured or a read fails, the app safely falls back to mock data.

Return to mock mode by setting:

```bash
NEXT_PUBLIC_DATA_MODE=mock
```

## 6. Row Level Security

Initial RLS policies:
- Public can read published properties.
- Public can read active rooms for published properties.
- Public can read published restaurants, experiences, and transfers.
- Public can read media only when linked to published properties.
- Public cannot write data.
- Partner write access is intentionally not added in this epic.

Future partner ownership policies should use authenticated users and partner ownership mapping, for example:

```sql
-- Future example only:
-- partner_id = auth.uid() mapped through a partner_users table
```

## 7. Rollback Strategy

Before production data exists:

```bash
supabase db reset
```

After production data exists:
1. Do not reset the database.
2. Create a new migration that reverses the specific change.
3. Back up data before destructive schema changes.
4. Keep `NEXT_PUBLIC_DATA_MODE=mock` if Supabase is unstable.

## 8. Verification Commands

Check CLI/project status:

```bash
npm run supabase:status
```

Check applied migrations:

```bash
npm run supabase:migrations
```

Verify tables in Supabase SQL editor:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

Verify published properties:

```sql
select id, name, slug, publication_status
from public.properties
where publication_status = 'published';
```

## 9. Admin Health Check

The Admin Dashboard system status includes:
- Data mode
- Supabase configured yes/no
- Database reachable/demo status
- Migration version

The health check never displays keys. When `SUPABASE_SERVICE_ROLE_KEY` is available, it uses server-only service-role access to check admin tables. Without service role, it falls back to anon reads and may report protected tables as inaccessible.

## 10. Caching and Rendering

The property read pilot runs through server-side data loading in the App Router. Public property reads use the anon key and RLS. The current implementation is compatible with static builds and mock fallback; when moving more pages to Supabase, add explicit revalidation rules per route based on freshness needs.

## 11. Troubleshooting

Missing environment variables:
- Keep `NEXT_PUBLIC_DATA_MODE=mock`.
- Confirm `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Migration not applied:
- Run `npm run supabase:migrations`.
- Run `npm run supabase:push`.
- Check the Admin Dashboard database status.

Empty database:
- Run `npm run supabase:reset-and-seed`.
- Confirm `public.properties` contains a published row.

Duplicate slugs:
- Property slugs must be unique.
- Use the Admin property import preview panel before manual imports.

Cloudflare environment setup:
- Add `NEXT_PUBLIC_DATA_MODE`.
- Add `NEXT_PUBLIC_SUPABASE_URL`.
- Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Add `SUPABASE_SERVICE_ROLE_KEY` only as a protected server-side secret.
- Do not expose the service role key to browser/client code.

## 12. Manual Checklist for Ahmed

1. Create the Supabase project.
2. Copy the URL and keys into `.env.local`.
3. Install the Supabase CLI if needed.
4. Run `supabase login`.
5. Run `npm run supabase:link -- --project-ref your-project-ref`.
6. Run `npm run supabase:push`.
7. Seed demo data with `npm run supabase:reset-and-seed` or SQL editor.
8. Keep `NEXT_PUBLIC_DATA_MODE=mock` until ready to test adapters.
9. Switch to `NEXT_PUBLIC_DATA_MODE=supabase` only for controlled testing.
10. Confirm `/admin` still requires the demo password gate.
