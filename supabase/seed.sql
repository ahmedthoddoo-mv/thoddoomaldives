insert into public.membership_plans (id, name, price_label, description, features)
values
  ('00000000-0000-0000-0000-000000000001', 'Free', '$0', 'Starter listing and WhatsApp visibility.', array['Basic profile', 'WhatsApp button']),
  ('00000000-0000-0000-0000-000000000002', 'Verified', '$29/mo', 'Verified badge and richer content support.', array['Verified badge', 'Gallery support', 'Priority review']),
  ('00000000-0000-0000-0000-000000000003', 'Premium', '$79/mo', 'Featured placement, analytics, and campaign support.', array['Featured placement', 'Analytics', 'Media management'])
on conflict (id) do nothing;

insert into public.partners (id, business_name, slug, owner_name, category, status, membership_plan_id, verification_status, whatsapp, email, website, address, latitude, longitude, lead_source, priority)
values
  ('10000000-0000-0000-0000-000000000001', 'Thoddoo Sun Sky Inn', 'thoddoo-sun-sky-inn', 'Aminath Haleema', 'guesthouse', 'verified', '00000000-0000-0000-0000-000000000003', 'verified', '+960 914 2538', 'stay@thoddoosunsky.example', 'https://thoddoosunsky.example', 'Central Thoddoo, Alif Alif Atoll', 4.4376000, 72.9596000, 'Partner onboarding', 'high'),
  ('10000000-0000-0000-0000-000000000002', 'Island Bites', 'island-bites', 'Ahmed Sameer', 'restaurant', 'pending', '00000000-0000-0000-0000-000000000002', 'pending', '+960 700 3040', 'hello@islandbites.example', 'https://instagram.com/islandbites', 'Main Road, Thoddoo', 4.4382000, 72.9605000, 'Local team', 'medium'),
  ('10000000-0000-0000-0000-000000000003', 'Blue Channel Speedboat', 'blue-channel-speedboat', 'Ali Nizam', 'transfer', 'contacted', '00000000-0000-0000-0000-000000000003', 'pending', '+960 700 5070', 'bookings@bluechannel.example', 'https://bluechannel.example', 'Thoddoo Harbor', 4.4369000, 72.9579000, 'Admin import', 'high')
on conflict (id) do nothing;

insert into public.properties (id, partner_id, name, slug, island, address, latitude, longitude, whatsapp, email, website, short_description, full_description, hero_image_path, check_in_time, check_out_time, membership_plan_id, verification_status, publication_status, featured, seo_title, seo_description)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Thoddoo Sun Sky Inn', 'thoddoo-sun-sky-inn', 'Thoddoo', 'Central Thoddoo, Alif Alif Atoll', 4.4376000, 72.9596000, '+960 914 2538', 'stay@thoddoosunsky.example', 'https://thoddoosunsky.example', 'Verified guesthouse with breakfast, beach access notes, and direct WhatsApp booking.', 'Comfortable verified guesthouse profile prepared for local island travelers.', '/images/hero-thoddoo.jpg', '14:00', '12:00', '00000000-0000-0000-0000-000000000003', 'verified', 'published', true, 'Thoddoo Sun Sky Inn | Verified Guesthouse', 'Book Thoddoo Sun Sky Inn with local support, breakfast, beach access, and WhatsApp booking.'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Palm Garden Thoddoo', 'palm-garden-thoddoo', 'Thoddoo', 'Palm Garden Road, Thoddoo', 4.4380000, 72.9611000, '+960 700 1020', 'hello@palmgarden.example', 'https://palmgarden.example', 'Garden guesthouse applicant with room inventory and content review pending.', 'Demo property record for future publishing workflows.', '/images/homepage/hero-2.jpg', '13:00', '11:00', '00000000-0000-0000-0000-000000000001', 'pending', 'draft', false, 'Palm Garden Thoddoo Guesthouse', 'Palm Garden Thoddoo guesthouse profile prepared for review.'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Coral Wave Residence', 'coral-wave-residence', 'Thoddoo', 'Beach Route, Thoddoo', 4.4392000, 72.9584000, '+960 700 2040', 'reservations@coralwave.example', 'https://coralwave.example', 'Premium-ready property record for featured placement and rich media workflows.', 'Premium demo profile for analytics, featured placement, gallery management, and SEO validation.', '/images/homepage/hero-5.jpg', '15:00', '12:00', '00000000-0000-0000-0000-000000000003', 'suspended', 'draft', false, 'Coral Wave Residence | Premium Thoddoo Stay', 'Premium residence demo profile with suite inventory and gallery assets.')
on conflict (id) do nothing;

insert into public.rooms (id, property_id, name, bed_type, capacity, adults, children, price_per_night, breakfast_included, description, active)
values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Deluxe Double Room', '1 Double Bed', '2 guests', 2, 0, 85, true, 'Comfortable double room with private bathroom.', true),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Family Room', '1 Double Bed + 2 Single Beds', '4 guests', 2, 2, 130, true, 'Family room with breakfast and beach towels.', true),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'Garden Room', '1 Queen Bed', '2 guests', 2, 0, 72, true, 'Garden-facing room for couples.', true),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'Triple Room', '1 Double Bed + 1 Single Bed', '3 guests', 2, 1, 105, true, 'Triple room for small families.', true),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', 'Premium Suite', '1 King Bed', '2 guests', 2, 0, 165, true, 'Premium suite with balcony.', true),
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000003', 'Two Bedroom Suite', '2 Bedrooms', '5 guests', 4, 1, 240, true, 'Two-bedroom suite for families.', true)
on conflict (id) do nothing;

insert into public.experiences (id, slug, title, description, category, duration, price, image_path, highlights, publication_status, featured)
values
  ('40000000-0000-0000-0000-000000000001', 'turtle-snorkeling', 'Turtle Snorkeling', 'Guided snorkeling experience around Thoddoo reef areas.', 'snorkeling', '2-3 hours', 'From USD 35 per person', '/images/homepage/hero-4.jpg', array['Local guide', 'Snorkeling equipment', 'Small group option'], 'published', true),
  ('40000000-0000-0000-0000-000000000002', 'sandbank-escape', 'Sandbank Escape', 'White-sand sandbank day with lagoon swimming.', 'sandbank', 'Half day', 'From USD 60 per person', '/images/hero-thoddoo.jpg', array['Boat transfer', 'Lagoon swimming', 'Private options'], 'published', true),
  ('40000000-0000-0000-0000-000000000003', 'sunset-fishing', 'Sunset Fishing', 'Traditional Maldivian fishing at golden hour.', 'fishing', '2-3 hours', 'From USD 40 per person', '/images/homepage/hero-1.jpg', array['Local captain', 'Sunset departure', 'Family-friendly'], 'published', true),
  ('40000000-0000-0000-0000-000000000004', 'dolphin-cruise', 'Dolphin Cruise', 'Open-water dolphin watching near Thoddoo.', 'cruise', '2 hours', 'From USD 50 per person', '/images/homepage/hero-4.jpg', array['Morning or sunset', 'Scenic lagoon cruise'], 'published', false),
  ('40000000-0000-0000-0000-000000000005', 'watermelon-farm-tour', 'Watermelon Farm Tour', 'Walk through Thoddoo farms and taste local fruit.', 'culture', '1-2 hours', 'From USD 15 per person', '/images/homepage/hero-6.jpg', array['Guided farm walk', 'Fruit tasting'], 'published', false)
on conflict (id) do nothing;

insert into public.restaurants (id, slug, name, description, cuisine, location, price_range, opening_hours, image_path, publication_status, featured)
values
  ('50000000-0000-0000-0000-000000000001', 'island-cafe', 'Island Cafe', 'Casual Thoddoo cafe for local meals, snacks, and drinks.', array['maldivian', 'cafe', 'seafood'], 'Thoddoo, Maldives', '$$', 'Daily hours vary by season', '/images/homepage/hero-6.jpg', 'published', true),
  ('50000000-0000-0000-0000-000000000002', 'harbour-grill', 'Harbour Grill', 'Seafood and international dishes close to island life.', array['seafood', 'international'], 'Near Thoddoo harbour', '$$', 'Evening service, confirm locally', '/images/hero-thoddoo.jpg', 'published', false),
  ('50000000-0000-0000-0000-000000000003', 'lagoon-bite-cafe', 'Lagoon Bite Cafe', 'Fresh juices, coffee, and simple island lunches.', array['cafe', 'healthy'], 'Main Road, Thoddoo', '$', 'Breakfast and lunch', '/images/homepage/hero-3.jpg', 'published', false)
on conflict (id) do nothing;

insert into public.transfers (id, slug, title, transfer_type, description, duration, price, departure_point, arrival_point, schedule_note, image_path, highlights, publication_status, featured)
values
  ('60000000-0000-0000-0000-000000000001', 'public-speedboat', 'Public Speedboat', 'public-speedboat', 'Common transfer between airport, Male, and Thoddoo.', 'Around 1 hour 15 minutes', 'From USD 35 per person', 'Male / Velana International Airport area', 'Thoddoo harbour', 'Schedules can change due to weather.', '/images/hero-thoddoo.jpg', array['Most popular option', 'Advance booking recommended'], 'published', true),
  ('60000000-0000-0000-0000-000000000002', 'private-speedboat', 'Private Speedboat', 'private-speedboat', 'Flexible private transfer for families and groups.', 'Around 1 hour', 'Price on request', 'Airport or Male pickup', 'Thoddoo harbour', 'Subject to weather and availability.', '/images/homepage/hero-1.jpg', array['Flexible timing', 'Best for groups'], 'published', true),
  ('60000000-0000-0000-0000-000000000003', 'public-ferry', 'Public Ferry', 'public-ferry', 'Budget-friendly ferry guidance for flexible travelers.', 'Around 4-5 hours', 'Budget friendly', 'Male ferry terminal', 'Thoddoo harbour', 'Limited operating days.', '/images/homepage/hero-2.jpg', array['Lowest cost option', 'Flexible travelers'], 'published', false)
on conflict (id) do nothing;

insert into public.media_assets (id, filename, path, category, file_type, width, height, alt_text, caption, rights_status)
values
  ('70000000-0000-0000-0000-000000000001', 'hero-thoddoo.jpg', '/images/hero-thoddoo.jpg', 'Hero', 'image/jpeg', 1600, 1000, 'Thoddoo lagoon and island scenery', 'Main Thoddoo hero image', 'internal_demo_asset'),
  ('70000000-0000-0000-0000-000000000002', 'hero-1.jpg', '/images/homepage/hero-1.jpg', 'Guesthouses', 'image/jpeg', 1600, 1000, 'Guesthouse and island lifestyle', 'Homepage hero image 1', 'internal_demo_asset'),
  ('70000000-0000-0000-0000-000000000003', 'hero-2.jpg', '/images/homepage/hero-2.jpg', 'Rooms', 'image/jpeg', 1600, 1000, 'Room and garden preview', 'Homepage hero image 2', 'internal_demo_asset'),
  ('70000000-0000-0000-0000-000000000004', 'hero-4.jpg', '/images/homepage/hero-4.jpg', 'Experiences', 'image/jpeg', 1600, 1000, 'Snorkeling and lagoon experience', 'Homepage hero image 4', 'internal_demo_asset'),
  ('70000000-0000-0000-0000-000000000005', 'hero-6.jpg', '/images/homepage/hero-6.jpg', 'Restaurants', 'image/jpeg', 1600, 1000, 'Island dining and cafe mood', 'Homepage hero image 6', 'internal_demo_asset')
on conflict (id) do nothing;

insert into public.property_media (property_id, media_asset_id, usage, sort_order)
values
  ('20000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'hero', 1),
  ('20000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000002', 'gallery', 2),
  ('20000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000004', 'gallery', 3),
  ('20000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000003', 'hero', 1),
  ('20000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000005', 'hero', 1)
on conflict do nothing;

insert into public.guests (id, full_name, whatsapp, email, country)
values
  ('80000000-0000-0000-0000-000000000001', 'Maya R.', '+44 7000 000001', 'maya@example.com', 'United Kingdom'),
  ('80000000-0000-0000-0000-000000000002', 'Daniel K.', '+49 170 000002', 'daniel@example.com', 'Germany'),
  ('80000000-0000-0000-0000-000000000003', 'Elena S.', '+39 300 000003', 'elena@example.com', 'Italy')
on conflict (id) do nothing;

insert into public.bookings (id, guest_id, property_id, room_id, partner_id, check_in, check_out, adults, children, booking_total, commission_percent, company_revenue, partner_revenue, booking_status, payment_status, special_requests)
values
  ('90000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '2026-08-12', '2026-08-17', 2, 0, 600, 10, 60, 540, 'new', 'demo_only', 'Airport transfer and turtle snorkeling'),
  ('90000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '2026-08-20', '2026-08-26', 2, 2, 915, 10, 91.5, 823.5, 'pending', 'demo_only', 'Family room and half board'),
  ('90000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '2026-09-02', '2026-09-06', 1, 0, 420, 10, 42, 378, 'confirmed', 'demo_only', 'Breakfast add-on')
on conflict (id) do nothing;

insert into public.crm_tasks (id, partner_id, title, task_type, owner, due_date, status, priority)
values
  ('a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Call owner to confirm airport transfer support', 'Call Owner', 'Operations', '2026-07-12', 'open', 'high'),
  ('a0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Collect hero and food photos', 'Need Photos', 'Content', '2026-07-14', 'in_progress', 'medium')
on conflict (id) do nothing;

insert into public.crm_notes (id, partner_id, author, body)
values
  ('b0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Admin', 'Owner interested. Premium dashboard demo shared and verification approved.'),
  ('b0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Content', 'Need better photos before restaurant page can be featured.')
on conflict (id) do nothing;
