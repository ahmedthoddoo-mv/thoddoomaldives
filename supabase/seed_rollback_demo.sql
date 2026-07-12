-- Removes only the known Project Atlas demo seed rows.
-- Run manually in Supabase SQL Editor if Ahmed wants to roll back demo data.
-- This does not drop schema and does not touch unknown production rows.

begin;

delete from public.crm_notes
where id in (
  'b0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000002'
);

delete from public.crm_tasks
where id in (
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000002'
);

delete from public.bookings
where id in (
  '90000000-0000-0000-0000-000000000001',
  '90000000-0000-0000-0000-000000000002',
  '90000000-0000-0000-0000-000000000003'
);

delete from public.guests
where id in (
  '80000000-0000-0000-0000-000000000001',
  '80000000-0000-0000-0000-000000000002',
  '80000000-0000-0000-0000-000000000003'
);

delete from public.property_media
where property_id in (
  select id from public.properties where slug in ('thoddoo-sun-sky-inn', 'palm-garden-thoddoo', 'coral-wave-residence')
);

delete from public.property_experiences
where property_id in (
  select id from public.properties where slug in ('thoddoo-sun-sky-inn', 'palm-garden-thoddoo', 'coral-wave-residence')
);

delete from public.property_transfers
where property_id in (
  select id from public.properties where slug in ('thoddoo-sun-sky-inn', 'palm-garden-thoddoo', 'coral-wave-residence')
);

delete from public.rooms
where property_id in (
  select id from public.properties where slug in ('thoddoo-sun-sky-inn', 'palm-garden-thoddoo', 'coral-wave-residence')
);

delete from public.properties
where slug in ('thoddoo-sun-sky-inn', 'palm-garden-thoddoo', 'coral-wave-residence');

delete from public.partners
where slug in ('thoddoo-sun-sky-inn', 'palm-garden-thoddoo', 'coral-wave-residence');

delete from public.restaurants
where slug in ('island-cafe', 'harbour-grill', 'lagoon-bite-cafe');

delete from public.experiences
where slug in ('turtle-snorkeling', 'sandbank-escape', 'sunset-fishing', 'dolphin-cruise', 'watermelon-farm-tour');

delete from public.transfers
where slug in ('public-speedboat', 'private-speedboat', 'public-ferry');

delete from public.media_assets
where path in (
  '/images/hero-thoddoo.jpg',
  '/images/homepage/hero-1.jpg',
  '/images/homepage/hero-2.jpg',
  '/images/homepage/hero-4.jpg',
  '/images/homepage/hero-6.jpg'
);

-- Membership plans are canonical platform rows, not demo-only rows.
-- Leave Free, Verified, and Premium in place to avoid affecting future real partners/properties.

commit;
