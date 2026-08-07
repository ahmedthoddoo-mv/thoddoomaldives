-- Recreate public_restaurants view to include new contact and location fields
-- added in migration 20260809100000_restaurant_contact_and_media_purpose.sql

drop view if exists public.public_restaurants;

create view public.public_restaurants with (security_invoker = true) as
  select
    id, slug, name, description, cuisine,
    location, price_range, opening_hours,
    phone, whatsapp, email, website, instagram, facebook,
    address, latitude, longitude,
    image_path, featured,
    publication_status, verification_status,
    application_id, partner_id,
    created_at, updated_at
  from public.restaurants
  where publication_status = 'published'
    and verification_status = 'verified';

grant select on public.public_restaurants to anon, authenticated;
