-- Verification queries for Project Atlas seed data.
-- Run manually in Supabase SQL Editor after applying supabase/seed.sql.

select 'membership_plans' as table_name, count(*) as actual_count, 3 as expected_seed_count
from public.membership_plans
where name in ('Free', 'Verified', 'Premium')
union all
select 'partners', count(*), 3
from public.partners
where slug in ('thoddoo-sun-sky-inn', 'palm-garden-thoddoo', 'coral-wave-residence')
union all
select 'properties', count(*), 3
from public.properties
where slug in ('thoddoo-sun-sky-inn', 'palm-garden-thoddoo', 'coral-wave-residence')
union all
select 'rooms', count(*), 6
from public.rooms
where property_id in (
  select id from public.properties where slug in ('thoddoo-sun-sky-inn', 'palm-garden-thoddoo', 'coral-wave-residence')
)
union all
select 'restaurants', count(*), 3
from public.restaurants
where slug in ('island-cafe', 'harbour-grill', 'lagoon-bite-cafe')
union all
select 'experiences', count(*), 5
from public.experiences
where slug in ('turtle-snorkeling', 'sandbank-escape', 'sunset-fishing', 'dolphin-cruise', 'watermelon-farm-tour')
union all
select 'transfers', count(*), 3
from public.transfers
where slug in ('public-speedboat', 'private-speedboat', 'public-ferry')
union all
select 'media_assets', count(*), 5
from public.media_assets
where path in (
  '/images/hero-thoddoo.jpg',
  '/images/homepage/hero-1.jpg',
  '/images/homepage/hero-2.jpg',
  '/images/homepage/hero-4.jpg',
  '/images/homepage/hero-6.jpg'
)
union all
select 'property_media', count(*), 5
from public.property_media
where property_id in (
  select id from public.properties where slug in ('thoddoo-sun-sky-inn', 'palm-garden-thoddoo', 'coral-wave-residence')
)
union all
select 'property_experiences', count(*), 5
from public.property_experiences
where property_id in (
  select id from public.properties where slug in ('thoddoo-sun-sky-inn', 'palm-garden-thoddoo', 'coral-wave-residence')
)
union all
select 'property_transfers', count(*), 5
from public.property_transfers
where property_id in (
  select id from public.properties where slug in ('thoddoo-sun-sky-inn', 'palm-garden-thoddoo', 'coral-wave-residence')
)
order by table_name;

-- Duplicate slug checks. Every row returned here needs review.
select 'partners' as table_name, slug, count(*)
from public.partners
group by slug
having count(*) > 1
union all
select 'properties', slug, count(*)
from public.properties
group by slug
having count(*) > 1
union all
select 'restaurants', slug, count(*)
from public.restaurants
group by slug
having count(*) > 1
union all
select 'experiences', slug, count(*)
from public.experiences
group by slug
having count(*) > 1
union all
select 'transfers', slug, count(*)
from public.transfers
group by slug
having count(*) > 1;

-- Public property read smoke test for /stay.
select property.slug, property.name, property.publication_status, property.verification_status, count(room.id) as room_count
from public.properties property
left join public.rooms room on room.property_id = property.id
where property.slug in ('thoddoo-sun-sky-inn', 'palm-garden-thoddoo', 'coral-wave-residence')
group by property.slug, property.name, property.publication_status, property.verification_status
order by property.slug;
