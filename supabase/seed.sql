-- Project Atlas seed data for iThoddoo Maldives.
-- Repeatable by design: stable slugs/IDs, upserts, and foreign keys resolved by slug/name.
-- Data labels:
-- - VERIFIED PROJECT DATA: data already present in the Project Atlas source files for Thoddoo Sun Sky Inn.
-- - DEMO DATA ONLY: synthetic/demo records used for UI and Supabase workflow testing.
-- - NEEDS CONFIRMATION: placeholder values that must be verified before production use.

begin;

-- ---------------------------------------------------------------------------
-- Membership plans
-- ---------------------------------------------------------------------------

insert into public.membership_plans (id, name, price_label, description, features, active)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'Free',
    '$0',
    'Starter listing and WhatsApp visibility.',
    array['Basic profile', 'WhatsApp button'],
    true
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Verified',
    '$29/mo',
    'Verified badge and richer content support.',
    array['Verified badge', 'Gallery support', 'Priority review'],
    true
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Premium',
    '$79/mo',
    'Featured placement, analytics, and campaign support.',
    array['Featured placement', 'Analytics', 'Media management'],
    true
  )
on conflict (name) do update set
  price_label = excluded.price_label,
  description = excluded.description,
  features = excluded.features,
  active = excluded.active,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Partners
-- ---------------------------------------------------------------------------

-- VERIFIED PROJECT DATA: Thoddoo Sun Sky Inn exists in the Project Atlas source dataset.
-- NEEDS CONFIRMATION: owner name, email, website, GPS, and detailed contact data before production.
insert into public.partners (
  id,
  business_name,
  slug,
  owner_name,
  category,
  status,
  membership_plan_id,
  verification_status,
  whatsapp,
  email,
  website,
  address,
  latitude,
  longitude,
  lead_source,
  priority
)
values
  (
    '10000000-0000-0000-0000-000000000001',
    'Thoddoo Sun Sky Inn',
    'thoddoo-sun-sky-inn',
    'Needs confirmation',
    'guesthouse',
    'verified',
    (select id from public.membership_plans where name = 'Premium'),
    'verified',
    '+960 9910136',
    'reservation@thoddoosunskyinn.com',
    'https://thoddoosunskyinn.com',
    'Central Thoddoo, Alif Alif Atoll',
    4.4376000,
    72.9596000,
    'Project Atlas verified dataset',
    'high'
  ),
  -- DEMO DATA ONLY: Palm Garden supports draft/pending publishing workflows.
  (
    '10000000-0000-0000-0000-000000000002',
    'Palm Garden Thoddoo',
    'palm-garden-thoddoo',
    'Demo owner - needs confirmation',
    'guesthouse',
    'pending',
    (select id from public.membership_plans where name = 'Free'),
    'pending',
    '+960 700 1020',
    'hello@palmgarden.example',
    'https://palmgarden.example',
    'Palm Garden Road, Thoddoo',
    4.4380000,
    72.9611000,
    'Demo seed',
    'medium'
  ),
  -- DEMO DATA ONLY: Coral Wave supports suspended/draft workflows.
  (
    '10000000-0000-0000-0000-000000000003',
    'Coral Wave Residence',
    'coral-wave-residence',
    'Demo owner - needs confirmation',
    'guesthouse',
    'suspended',
    (select id from public.membership_plans where name = 'Premium'),
    'suspended',
    '+960 700 2040',
    'reservations@coralwave.example',
    'https://coralwave.example',
    'Beach Route, Thoddoo',
    4.4392000,
    72.9584000,
    'Demo seed',
    'low'
  )
on conflict (slug) do update set
  business_name = excluded.business_name,
  owner_name = excluded.owner_name,
  category = excluded.category,
  status = excluded.status,
  membership_plan_id = excluded.membership_plan_id,
  verification_status = excluded.verification_status,
  whatsapp = excluded.whatsapp,
  email = excluded.email,
  website = excluded.website,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  lead_source = excluded.lead_source,
  priority = excluded.priority,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Properties
-- ---------------------------------------------------------------------------

insert into public.properties (
  id,
  partner_id,
  name,
  slug,
  island,
  address,
  latitude,
  longitude,
  whatsapp,
  email,
  website,
  short_description,
  full_description,
  hero_image_path,
  amenities,
  policies,
  check_in_time,
  check_out_time,
  membership_plan_id,
  verification_status,
  publication_status,
  featured,
  seo_title,
  seo_description
)
values
  -- VERIFIED PROJECT DATA; NEEDS CONFIRMATION for production owner/legal/property details.
  (
    '20000000-0000-0000-0000-000000000001',
    (select id from public.partners where slug = 'thoddoo-sun-sky-inn'),
    'Thoddoo Sun Sky Inn',
    'thoddoo-sun-sky-inn',
    'Thoddoo',
    'Central Thoddoo, Alif Alif Atoll',
    4.4376000,
    72.9596000,
    '+960 914 2538',
    'stay@thoddoosunsky.example',
    'https://thoddoosunsky.example',
    'Verified guesthouse with breakfast, beach access notes, and direct WhatsApp booking.',
    'Comfortable verified guesthouse profile prepared for local island travelers. Some operational details still need owner confirmation before production.',
    '/images/hero-thoddoo.jpg',
    array['Breakfast', 'Wi-Fi', 'Airport transfer help', 'Beach towels', 'Bicycles'],
    array['Free cancellation until 7 days before arrival - needs confirmation', 'Passport details required at check-in - needs confirmation', 'No alcohol on local island'],
    '14:00',
    '12:00',
    (select id from public.membership_plans where name = 'Premium'),
    'verified',
    'published',
    true,
    'Thoddoo Sun Sky Inn | Verified Guesthouse',
    'Book Thoddoo Sun Sky Inn with local support, breakfast, beach access, and WhatsApp booking.'
  ),
  -- DEMO DATA ONLY.
  (
    '20000000-0000-0000-0000-000000000002',
    (select id from public.partners where slug = 'palm-garden-thoddoo'),
    'Palm Garden Thoddoo',
    'palm-garden-thoddoo',
    'Thoddoo',
    'Palm Garden Road, Thoddoo',
    4.4380000,
    72.9611000,
    '+960 700 1020',
    'hello@palmgarden.example',
    'https://palmgarden.example',
    'Garden guesthouse applicant with room inventory and content review pending.',
    'Demo property record for future publishing workflows. All business facts need confirmation before production.',
    '/images/homepage/hero-2.jpg',
    array['Garden', 'Breakfast', 'Wi-Fi', 'Laundry support'],
    array['Breakfast included on selected rates - demo', 'Check transfer timing before arrival - demo', 'Quiet hours after 22:00 - demo'],
    '13:00',
    '11:00',
    (select id from public.membership_plans where name = 'Free'),
    'pending',
    'draft',
    false,
    'Palm Garden Thoddoo Guesthouse',
    'Palm Garden Thoddoo guesthouse profile prepared for review.'
  ),
  -- DEMO DATA ONLY.
  (
    '20000000-0000-0000-0000-000000000003',
    (select id from public.partners where slug = 'coral-wave-residence'),
    'Coral Wave Residence',
    'coral-wave-residence',
    'Thoddoo',
    'Beach Route, Thoddoo',
    4.4392000,
    72.9584000,
    '+960 700 2040',
    'reservations@coralwave.example',
    'https://coralwave.example',
    'Premium-ready property record for featured placement and rich media workflows.',
    'Premium demo profile for analytics, featured placement, gallery management, and SEO validation. All business facts need confirmation before production.',
    '/images/homepage/hero-5.jpg',
    array['Premium breakfast', 'Private balcony', 'Concierge support', 'Professional photography'],
    array['Deposit may be requested for peak dates - demo', 'Guest transfer support available - demo', 'Property is currently hidden from public recommendations - demo'],
    '15:00',
    '12:00',
    (select id from public.membership_plans where name = 'Premium'),
    'suspended',
    'draft',
    false,
    'Coral Wave Residence | Premium Thoddoo Stay',
    'Premium residence demo profile with suite inventory and gallery assets.'
  )
on conflict (slug) do update set
  partner_id = excluded.partner_id,
  name = excluded.name,
  island = excluded.island,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  whatsapp = excluded.whatsapp,
  email = excluded.email,
  website = excluded.website,
  short_description = excluded.short_description,
  full_description = excluded.full_description,
  hero_image_path = excluded.hero_image_path,
  amenities = excluded.amenities,
  policies = excluded.policies,
  check_in_time = excluded.check_in_time,
  check_out_time = excluded.check_out_time,
  membership_plan_id = excluded.membership_plan_id,
  verification_status = excluded.verification_status,
  publication_status = excluded.publication_status,
  featured = excluded.featured,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Rooms
-- Up to five rooms per property. Current project data has two room types per property.
-- ---------------------------------------------------------------------------

insert into public.rooms (
  id,
  property_id,
  name,
  bed_type,
  capacity,
  adults,
  children,
  price_per_night,
  breakfast_included,
  description,
  active
)
values
  -- VERIFIED PROJECT DATA from current Project Atlas property record; needs owner confirmation before production.
  ('30000000-0000-0000-0000-000000000001', (select id from public.properties where slug = 'thoddoo-sun-sky-inn'), 'Deluxe Double', 'Flexible bedding - needs confirmation', '2 guests', 2, 0, 85, true, 'Project Atlas room type. Bedding and exact inclusions need confirmation.', true),
  ('30000000-0000-0000-0000-000000000002', (select id from public.properties where slug = 'thoddoo-sun-sky-inn'), 'Family Room', 'Flexible bedding - needs confirmation', '4 guests', 2, 2, 130, true, 'Project Atlas room type. Bedding and exact inclusions need confirmation.', true),
  -- DEMO DATA ONLY.
  ('30000000-0000-0000-0000-000000000003', (select id from public.properties where slug = 'palm-garden-thoddoo'), 'Garden Room', 'Demo bedding', '2 guests', 2, 0, 72, true, 'Demo room used for draft property workflows.', true),
  ('30000000-0000-0000-0000-000000000004', (select id from public.properties where slug = 'palm-garden-thoddoo'), 'Triple Room', 'Demo bedding', '3 guests', 2, 1, 105, true, 'Demo room used for draft property workflows.', true),
  -- DEMO DATA ONLY.
  ('30000000-0000-0000-0000-000000000005', (select id from public.properties where slug = 'coral-wave-residence'), 'Premium Suite', 'Demo king bed', '2 guests', 2, 0, 165, true, 'Demo suite used for suspended premium workflows.', true),
  ('30000000-0000-0000-0000-000000000006', (select id from public.properties where slug = 'coral-wave-residence'), 'Two Bedroom Suite', 'Demo two bedroom setup', '5 guests', 4, 1, 240, true, 'Demo suite used for suspended premium workflows.', true)
on conflict (id) do update set
  property_id = excluded.property_id,
  name = excluded.name,
  bed_type = excluded.bed_type,
  capacity = excluded.capacity,
  adults = excluded.adults,
  children = excluded.children,
  price_per_night = excluded.price_per_night,
  breakfast_included = excluded.breakfast_included,
  description = excluded.description,
  active = excluded.active,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Restaurants: current project demo data.
-- ---------------------------------------------------------------------------

insert into public.restaurants (id, slug, name, description, cuisine, location, price_range, opening_hours, image_path, publication_status, featured)
values
  ('50000000-0000-0000-0000-000000000001', 'island-cafe', 'Island Cafe', 'DEMO DATA ONLY: Casual Thoddoo cafe for local meals, snacks, and drinks.', array['maldivian', 'cafe', 'seafood'], 'Thoddoo, Maldives', '$$', 'Daily hours vary by season - needs confirmation', '/images/homepage/hero-6.jpg', 'published', true),
  ('50000000-0000-0000-0000-000000000002', 'harbour-grill', 'Harbour Grill', 'DEMO DATA ONLY: Seafood and international dishes close to island life.', array['seafood', 'international'], 'Near Thoddoo harbour', '$$', 'Evening service, confirm locally', '/images/hero-thoddoo.jpg', 'published', false),
  ('50000000-0000-0000-0000-000000000003', 'lagoon-bite-cafe', 'Lagoon Bite Cafe', 'DEMO DATA ONLY: Fresh juices, coffee, and simple island lunches.', array['cafe', 'healthy'], 'Main Road, Thoddoo', '$', 'Breakfast and lunch - needs confirmation', '/images/homepage/hero-3.jpg', 'published', false)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  cuisine = excluded.cuisine,
  location = excluded.location,
  price_range = excluded.price_range,
  opening_hours = excluded.opening_hours,
  image_path = excluded.image_path,
  publication_status = excluded.publication_status,
  featured = excluded.featured,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Experiences: current project demo data.
-- ---------------------------------------------------------------------------

insert into public.experiences (id, slug, title, description, category, duration, price, image_path, highlights, publication_status, featured)
values
  ('40000000-0000-0000-0000-000000000001', 'turtle-snorkeling', 'Turtle Snorkeling', 'DEMO DATA ONLY: Guided snorkeling experience around Thoddoo reef areas.', 'snorkeling', '2-3 hours', 'From USD 35 per person', '/images/homepage/hero-4.jpg', array['Local guide', 'Snorkeling equipment', 'Small group option'], 'published', true),
  ('40000000-0000-0000-0000-000000000002', 'sandbank-escape', 'Sandbank Escape', 'DEMO DATA ONLY: White-sand sandbank day with lagoon swimming.', 'sandbank', 'Half day', 'From USD 60 per person', '/images/hero-thoddoo.jpg', array['Boat transfer', 'Lagoon swimming', 'Private options'], 'published', true),
  ('40000000-0000-0000-0000-000000000003', 'sunset-fishing', 'Sunset Fishing', 'DEMO DATA ONLY: Traditional Maldivian fishing at golden hour.', 'fishing', '2-3 hours', 'From USD 40 per person', '/images/homepage/hero-1.jpg', array['Local captain', 'Sunset departure', 'Family-friendly'], 'published', true),
  ('40000000-0000-0000-0000-000000000004', 'dolphin-cruise', 'Dolphin Cruise', 'DEMO DATA ONLY: Open-water dolphin watching near Thoddoo.', 'cruise', '2 hours', 'From USD 50 per person', '/images/homepage/hero-4.jpg', array['Morning or sunset', 'Scenic lagoon cruise'], 'published', false),
  ('40000000-0000-0000-0000-000000000005', 'watermelon-farm-tour', 'Watermelon Farm Tour', 'DEMO DATA ONLY: Walk through Thoddoo farms and taste local fruit.', 'culture', '1-2 hours', 'From USD 15 per person', '/images/homepage/hero-6.jpg', array['Guided farm walk', 'Fruit tasting'], 'published', false)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  duration = excluded.duration,
  price = excluded.price,
  image_path = excluded.image_path,
  highlights = excluded.highlights,
  publication_status = excluded.publication_status,
  featured = excluded.featured,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Transfers: current project demo data.
-- ---------------------------------------------------------------------------

insert into public.transfers (id, slug, title, transfer_type, description, duration, price, departure_point, arrival_point, schedule_note, image_path, highlights, publication_status, featured)
values
  ('60000000-0000-0000-0000-000000000001', 'public-speedboat', 'Public Speedboat', 'public-speedboat', 'DEMO DATA ONLY: Common transfer between airport, Male, and Thoddoo.', 'Around 1 hour 15 minutes', 'From USD 35 per person', 'Male / Velana International Airport area', 'Thoddoo harbour', 'Schedules can change due to weather - needs confirmation.', '/images/hero-thoddoo.jpg', array['Most popular option', 'Advance booking recommended'], 'published', true),
  ('60000000-0000-0000-0000-000000000002', 'private-speedboat', 'Private Speedboat', 'private-speedboat', 'DEMO DATA ONLY: Flexible private transfer for families and groups.', 'Around 1 hour', 'Price on request', 'Airport or Male pickup', 'Thoddoo harbour', 'Subject to weather and availability.', '/images/homepage/hero-1.jpg', array['Flexible timing', 'Best for groups'], 'published', true),
  ('60000000-0000-0000-0000-000000000003', 'public-ferry', 'Public Ferry', 'public-ferry', 'DEMO DATA ONLY: Budget-friendly ferry guidance for flexible travelers.', 'Around 4-5 hours', 'Budget friendly', 'Male ferry terminal', 'Thoddoo harbour', 'Limited operating days - needs confirmation.', '/images/homepage/hero-2.jpg', array['Lowest cost option', 'Flexible travelers'], 'published', false)
on conflict (slug) do update set
  title = excluded.title,
  transfer_type = excluded.transfer_type,
  description = excluded.description,
  duration = excluded.duration,
  price = excluded.price,
  departure_point = excluded.departure_point,
  arrival_point = excluded.arrival_point,
  schedule_note = excluded.schedule_note,
  image_path = excluded.image_path,
  highlights = excluded.highlights,
  publication_status = excluded.publication_status,
  featured = excluded.featured,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Media assets. All paths exist in public/images.
-- ---------------------------------------------------------------------------

insert into public.media_assets (id, filename, path, category, file_type, width, height, alt_text, caption, rights_status, archived)
values
  ('70000000-0000-0000-0000-000000000001', 'hero-thoddoo.jpg', '/images/hero-thoddoo.jpg', 'Hero', 'image/jpeg', 1600, 1000, 'Thoddoo lagoon and island scenery', 'Main Thoddoo hero image', 'internal_demo_asset', false),
  ('70000000-0000-0000-0000-000000000002', 'hero-1.jpg', '/images/homepage/hero-1.jpg', 'Guesthouses', 'image/jpeg', 1600, 1000, 'Guesthouse and island lifestyle', 'Homepage hero image 1', 'internal_demo_asset', false),
  ('70000000-0000-0000-0000-000000000003', 'hero-2.jpg', '/images/homepage/hero-2.jpg', 'Rooms', 'image/jpeg', 1600, 1000, 'Room and garden preview', 'Homepage hero image 2', 'internal_demo_asset', false),
  ('70000000-0000-0000-0000-000000000004', 'hero-4.jpg', '/images/homepage/hero-4.jpg', 'Experiences', 'image/jpeg', 1600, 1000, 'Snorkeling and lagoon experience', 'Homepage hero image 4', 'internal_demo_asset', false),
  ('70000000-0000-0000-0000-000000000005', 'hero-6.jpg', '/images/homepage/hero-6.jpg', 'Restaurants', 'image/jpeg', 1600, 1000, 'Island dining and cafe mood', 'Homepage hero image 6', 'internal_demo_asset', false)
on conflict (path) do update set
  filename = excluded.filename,
  category = excluded.category,
  file_type = excluded.file_type,
  width = excluded.width,
  height = excluded.height,
  alt_text = excluded.alt_text,
  caption = excluded.caption,
  rights_status = excluded.rights_status,
  archived = excluded.archived,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Property media links
-- ---------------------------------------------------------------------------

insert into public.property_media (property_id, media_asset_id, usage, sort_order)
select property.id, media.id, seed.usage, seed.sort_order
from (
  values
    ('thoddoo-sun-sky-inn', '/images/hero-thoddoo.jpg', 'hero', 1),
    ('thoddoo-sun-sky-inn', '/images/homepage/hero-1.jpg', 'gallery', 2),
    ('thoddoo-sun-sky-inn', '/images/homepage/hero-4.jpg', 'gallery', 3),
    ('palm-garden-thoddoo', '/images/homepage/hero-2.jpg', 'hero', 1),
    ('coral-wave-residence', '/images/homepage/hero-6.jpg', 'hero', 1)
) as seed(property_slug, media_path, usage, sort_order)
join public.properties property on property.slug = seed.property_slug
join public.media_assets media on media.path = seed.media_path
on conflict (property_id, media_asset_id, usage) do update set
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Property experience links
-- ---------------------------------------------------------------------------

insert into public.property_experiences (property_id, experience_id)
select property.id, experience.id
from (
  values
    ('thoddoo-sun-sky-inn', 'turtle-snorkeling'),
    ('thoddoo-sun-sky-inn', 'sandbank-escape'),
    ('thoddoo-sun-sky-inn', 'sunset-fishing'),
    ('palm-garden-thoddoo', 'watermelon-farm-tour'),
    ('coral-wave-residence', 'dolphin-cruise')
) as seed(property_slug, experience_slug)
join public.properties property on property.slug = seed.property_slug
join public.experiences experience on experience.slug = seed.experience_slug
on conflict (property_id, experience_id) do nothing;

-- ---------------------------------------------------------------------------
-- Property transfer links
-- ---------------------------------------------------------------------------

insert into public.property_transfers (property_id, transfer_id)
select property.id, transfer.id
from (
  values
    ('thoddoo-sun-sky-inn', 'public-speedboat'),
    ('thoddoo-sun-sky-inn', 'private-speedboat'),
    ('thoddoo-sun-sky-inn', 'public-ferry'),
    ('palm-garden-thoddoo', 'public-speedboat'),
    ('coral-wave-residence', 'private-speedboat')
) as seed(property_slug, transfer_slug)
join public.properties property on property.slug = seed.property_slug
join public.transfers transfer on transfer.slug = seed.transfer_slug
on conflict (property_id, transfer_id) do nothing;

-- ---------------------------------------------------------------------------
-- Optional demo booking data retained for booking workflow previews.
-- These rows are demo-only and can be removed with supabase/seed_rollback_demo.sql.
-- ---------------------------------------------------------------------------

insert into public.guests (id, full_name, whatsapp, email, country)
values
  ('80000000-0000-0000-0000-000000000001', 'Maya R. - demo guest', '+44 7000 000001', 'maya@example.com', 'United Kingdom'),
  ('80000000-0000-0000-0000-000000000002', 'Daniel K. - demo guest', '+49 170 000002', 'daniel@example.com', 'Germany'),
  ('80000000-0000-0000-0000-000000000003', 'Elena S. - demo guest', '+39 300 000003', 'elena@example.com', 'Italy')
on conflict (id) do update set
  full_name = excluded.full_name,
  whatsapp = excluded.whatsapp,
  email = excluded.email,
  country = excluded.country,
  updated_at = now();

insert into public.bookings (id, guest_id, property_id, room_id, partner_id, check_in, check_out, adults, children, booking_total, commission_percent, company_revenue, partner_revenue, booking_status, payment_status, special_requests)
values
  ('90000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', (select id from public.properties where slug = 'thoddoo-sun-sky-inn'), (select id from public.rooms where property_id = (select id from public.properties where slug = 'thoddoo-sun-sky-inn') and name = 'Deluxe Double'), (select id from public.partners where slug = 'thoddoo-sun-sky-inn'), '2026-08-12', '2026-08-17', 2, 0, 600, 10, 60, 540, 'new', 'demo_only', 'DEMO DATA ONLY: Airport transfer and turtle snorkeling'),
  ('90000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000002', (select id from public.properties where slug = 'thoddoo-sun-sky-inn'), (select id from public.rooms where property_id = (select id from public.properties where slug = 'thoddoo-sun-sky-inn') and name = 'Family Room'), (select id from public.partners where slug = 'thoddoo-sun-sky-inn'), '2026-08-20', '2026-08-26', 2, 2, 915, 10, 91.5, 823.5, 'pending', 'demo_only', 'DEMO DATA ONLY: Family room and half board'),
  ('90000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000003', (select id from public.properties where slug = 'thoddoo-sun-sky-inn'), (select id from public.rooms where property_id = (select id from public.properties where slug = 'thoddoo-sun-sky-inn') and name = 'Deluxe Double'), (select id from public.partners where slug = 'thoddoo-sun-sky-inn'), '2026-09-02', '2026-09-06', 1, 0, 420, 10, 42, 378, 'confirmed', 'demo_only', 'DEMO DATA ONLY: Breakfast add-on')
on conflict (id) do update set
  guest_id = excluded.guest_id,
  property_id = excluded.property_id,
  room_id = excluded.room_id,
  partner_id = excluded.partner_id,
  check_in = excluded.check_in,
  check_out = excluded.check_out,
  adults = excluded.adults,
  children = excluded.children,
  booking_total = excluded.booking_total,
  commission_percent = excluded.commission_percent,
  company_revenue = excluded.company_revenue,
  partner_revenue = excluded.partner_revenue,
  booking_status = excluded.booking_status,
  payment_status = excluded.payment_status,
  special_requests = excluded.special_requests,
  updated_at = now();

insert into public.crm_tasks (id, partner_id, title, task_type, owner, due_date, status, priority)
values
  ('a0000000-0000-0000-0000-000000000001', (select id from public.partners where slug = 'coral-wave-residence'), 'DEMO DATA ONLY: Call owner to confirm premium property details', 'Call Owner', 'Operations', '2026-07-12', 'open', 'high'),
  ('a0000000-0000-0000-0000-000000000002', (select id from public.partners where slug = 'palm-garden-thoddoo'), 'DEMO DATA ONLY: Collect hero and room photos', 'Need Photos', 'Content', '2026-07-14', 'in_progress', 'medium')
on conflict (id) do update set
  partner_id = excluded.partner_id,
  title = excluded.title,
  task_type = excluded.task_type,
  owner = excluded.owner,
  due_date = excluded.due_date,
  status = excluded.status,
  priority = excluded.priority,
  updated_at = now();

insert into public.crm_notes (id, partner_id, author, body)
values
  ('b0000000-0000-0000-0000-000000000001', (select id from public.partners where slug = 'thoddoo-sun-sky-inn'), 'Admin', 'VERIFIED PROJECT DATA: Source project marks this property as verified. Production owner/legal details still need confirmation.'),
  ('b0000000-0000-0000-0000-000000000002', (select id from public.partners where slug = 'palm-garden-thoddoo'), 'Content', 'DEMO DATA ONLY: Need better photos before restaurant/property page can be featured.')
on conflict (id) do update set
  partner_id = excluded.partner_id,
  author = excluded.author,
  body = excluded.body,
  updated_at = now();

commit;
