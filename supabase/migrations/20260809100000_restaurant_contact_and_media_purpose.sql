-- Migration: restaurant contact fields + business_media purpose column
-- Adds phone, whatsapp, email, website, social, address, lat/lng to restaurants.
-- Adds media_purpose to business_media to separate gallery/menu/logo categories.
-- Updates admin_save_business_listing to persist new restaurant fields.

-- ─── 1. Add contact + location fields to restaurants ─────────────────────────
alter table public.restaurants
  add column if not exists phone        text,
  add column if not exists whatsapp     text,
  add column if not exists email        text,
  add column if not exists website      text,
  add column if not exists instagram    text,
  add column if not exists facebook     text,
  add column if not exists address      text,
  add column if not exists latitude     numeric(10, 7),
  add column if not exists longitude    numeric(10, 7);

-- ─── 2. Add media_purpose to business_media ──────────────────────────────────
-- Allowed values: gallery, menu, logo, interior, exterior, food, cover
alter table public.business_media
  add column if not exists media_purpose text not null default 'gallery'
    check (media_purpose in ('gallery','menu','logo','interior','exterior','food','cover'));

-- ─── 3. Rebuild public_business_media view to expose media_purpose ────────────
-- Drop existing view and recreate with new column
drop view if exists public.public_business_media;

create view public.public_business_media as
select
  bm.id,
  bm.business_type,
  bm.business_id,
  bm.media_asset_id,
  bm.caption,
  bm.alt_text,
  bm.sort_order,
  bm.is_cover,
  bm.is_featured,
  bm.media_purpose,
  ma.path,
  ma.filename,
  ma.file_type,
  ma.width,
  ma.height,
  ma.storage_bucket,
  ma.storage_path
from public.business_media bm
join public.media_assets ma on ma.id = bm.media_asset_id
where bm.is_public
  and not ma.archived
  and case
    when bm.business_type = 'property' then exists (
      select 1
      from public.properties p
      where p.id = bm.business_id
        and p.publication_status = 'published'
        and p.verification_status = 'verified'
    )
    when bm.business_type = 'restaurant' then exists (
      select 1
      from public.restaurants r
      where r.id = bm.business_id
        and r.publication_status = 'published'
        and r.verification_status = 'verified'
    )
    when bm.business_type = 'experience' then exists (
      select 1
      from public.experiences e
      where e.id = bm.business_id
        and e.publication_status = 'published'
        and e.verification_status = 'verified'
    )
    when bm.business_type = 'transfer' then exists (
      select 1
      from public.transfers t
      where t.id = bm.business_id
        and t.publication_status = 'published'
        and t.verification_status = 'verified'
    )
    else false
  end;

grant select on public.public_business_media to anon, authenticated;

-- ─── 4. Update admin_save_business_listing to persist restaurant contact fields ─
create or replace function public.admin_save_business_listing(
  admin_user_id uuid, listing_type text, listing_uuid uuid, listing_payload jsonb
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  saved_id uuid;
  saved_application_id uuid;
  target_id uuid := coalesce(listing_uuid, gen_random_uuid());
  base_slug text;
  normalized_business_type text;
begin
  if auth.role() <> 'service_role' then raise exception 'service_role is required'; end if;
  if not exists (select 1 from public.admin_users where auth_user_id = admin_user_id and is_active and role in ('owner','admin')) then
    raise exception 'Save actor is not an active administrator';
  end if;
  if listing_type not in ('transfer','experience','restaurant') then raise exception 'Unsupported listing type'; end if;
  if nullif(trim(listing_payload->>'title'), '') is null then raise exception 'Title is required'; end if;
  if (listing_payload->>'publicationStatus') = 'published' and (listing_payload->>'verificationStatus') <> 'verified' then
    raise exception 'Only verified listings can be published';
  end if;
  base_slug := public.production_slug(listing_payload->>'title');
  normalized_business_type := public.normalize_admin_created_business_type(listing_type, listing_payload);

  if listing_type = 'transfer' then
    if listing_uuid is not null and not exists (select 1 from public.transfers where id = listing_uuid) then raise exception 'Listing UUID does not identify a transfer'; end if;
    if exists (select 1 from public.transfers where slug = base_slug and id <> target_id) then base_slug := base_slug || '-' || left(target_id::text, 8); end if;
    insert into public.transfers (id, slug, title, transfer_type, description, duration, price, departure_point, arrival_point, schedule_note, image_path, publication_status, verification_status, featured)
    values (target_id, base_slug, trim(listing_payload->>'title'), coalesce(nullif(listing_payload->>'transferType',''),'transfer-company'),
      coalesce(listing_payload->>'description',''), listing_payload->>'duration', nullif(listing_payload->>'price',''), listing_payload->>'departurePoint', listing_payload->>'arrivalPoint',
      listing_payload->>'schedule', coalesce(listing_payload->>'image',''), coalesce(listing_payload->>'publicationStatus','draft'), coalesce(listing_payload->>'verificationStatus','pending'), coalesce((listing_payload->>'featured')::boolean,false))
    on conflict (id) do update set title=excluded.title, transfer_type=excluded.transfer_type, description=excluded.description, duration=excluded.duration,
      price=excluded.price, departure_point=excluded.departure_point, arrival_point=excluded.arrival_point, schedule_note=excluded.schedule_note,
      image_path=excluded.image_path, publication_status=excluded.publication_status, verification_status=excluded.verification_status, featured=excluded.featured, updated_at=now()
    returning id into saved_id;

    select public.ensure_admin_listing_application(
      saved_id, 'transfer', trim(listing_payload->>'title'), normalized_business_type, 'Thoddoo',
      coalesce(nullif(listing_payload->>'departurePoint', ''), nullif(listing_payload->>'arrivalPoint', '')),
      coalesce(listing_payload->>'description', ''), '', '', '',
      (select application_id from public.transfers where id = saved_id)
    ) into saved_application_id;
    update public.transfers set application_id = saved_application_id where id = saved_id;

  elsif listing_type = 'experience' then
    if listing_uuid is not null and not exists (select 1 from public.experiences where id = listing_uuid) then raise exception 'Listing UUID does not identify an experience'; end if;
    if exists (select 1 from public.experiences where slug = base_slug and id <> target_id) then base_slug := base_slug || '-' || left(target_id::text, 8); end if;
    insert into public.experiences (id, slug, title, description, category, duration, price, image_path, highlights, publication_status, verification_status, featured)
    values (target_id, base_slug, trim(listing_payload->>'title'), coalesce(listing_payload->>'description',''), coalesce(nullif(listing_payload->>'category',''),'experience'),
      listing_payload->>'duration', nullif(listing_payload->>'price',''), coalesce(listing_payload->>'image',''), regexp_split_to_array(coalesce(listing_payload->>'highlights',''),'\s*\n\s*'),
      coalesce(listing_payload->>'publicationStatus','draft'), coalesce(listing_payload->>'verificationStatus','pending'), coalesce((listing_payload->>'featured')::boolean,false))
    on conflict (id) do update set title=excluded.title, description=excluded.description, category=excluded.category, duration=excluded.duration, price=excluded.price,
      image_path=excluded.image_path, highlights=excluded.highlights, publication_status=excluded.publication_status, verification_status=excluded.verification_status, featured=excluded.featured, updated_at=now()
    returning id into saved_id;

    select public.ensure_admin_listing_application(
      saved_id, 'experience', trim(listing_payload->>'title'), normalized_business_type, 'Thoddoo',
      nullif(listing_payload->>'location', ''), coalesce(listing_payload->>'description', ''), '', '', '',
      (select application_id from public.experiences where id = saved_id)
    ) into saved_application_id;
    update public.experiences set application_id = saved_application_id where id = saved_id;

  else
    -- restaurant
    if listing_uuid is not null and not exists (select 1 from public.restaurants where id = listing_uuid) then raise exception 'Listing UUID does not identify a restaurant'; end if;
    if exists (select 1 from public.restaurants where slug = base_slug and id <> target_id) then base_slug := base_slug || '-' || left(target_id::text, 8); end if;

    insert into public.restaurants (
      id, slug, name, description, cuisine, location, price_range, opening_hours,
      phone, whatsapp, email, website, instagram, facebook,
      address, latitude, longitude,
      image_path, publication_status, verification_status, featured
    )
    values (
      target_id, base_slug, trim(listing_payload->>'title'),
      coalesce(listing_payload->>'description',''),
      regexp_split_to_array(coalesce(listing_payload->>'cuisine',''),'\s*\n\s*'),
      listing_payload->>'location',
      listing_payload->>'price',
      listing_payload->>'openingHours',
      nullif(trim(coalesce(listing_payload->>'phone','')), ''),
      nullif(trim(coalesce(listing_payload->>'whatsapp','')), ''),
      nullif(trim(coalesce(listing_payload->>'email','')), ''),
      nullif(trim(coalesce(listing_payload->>'website','')), ''),
      nullif(trim(coalesce(listing_payload->>'instagram','')), ''),
      nullif(trim(coalesce(listing_payload->>'facebook','')), ''),
      nullif(trim(coalesce(listing_payload->>'address','')), ''),
      case when nullif(trim(coalesce(listing_payload->>'latitude','')), '') is not null
           then (listing_payload->>'latitude')::numeric else null end,
      case when nullif(trim(coalesce(listing_payload->>'longitude','')), '') is not null
           then (listing_payload->>'longitude')::numeric else null end,
      coalesce(listing_payload->>'image',''),
      coalesce(listing_payload->>'publicationStatus','draft'),
      coalesce(listing_payload->>'verificationStatus','pending'),
      coalesce((listing_payload->>'featured')::boolean,false)
    )
    on conflict (id) do update set
      name=excluded.name, description=excluded.description, cuisine=excluded.cuisine,
      location=excluded.location, price_range=excluded.price_range, opening_hours=excluded.opening_hours,
      phone=excluded.phone, whatsapp=excluded.whatsapp, email=excluded.email,
      website=excluded.website, instagram=excluded.instagram, facebook=excluded.facebook,
      address=excluded.address, latitude=excluded.latitude, longitude=excluded.longitude,
      image_path=excluded.image_path, publication_status=excluded.publication_status,
      verification_status=excluded.verification_status, featured=excluded.featured,
      updated_at=now()
    returning id into saved_id;

    select public.ensure_admin_listing_application(
      saved_id, 'restaurant', trim(listing_payload->>'title'), normalized_business_type, 'Thoddoo',
      nullif(listing_payload->>'location', ''), coalesce(listing_payload->>'description', ''),
      coalesce(listing_payload->>'phone', ''), coalesce(listing_payload->>'email', ''), '',
      (select application_id from public.restaurants where id = saved_id)
    ) into saved_application_id;
    update public.restaurants set application_id = saved_application_id where id = saved_id;
  end if;

  return jsonb_build_object('id', saved_id, 'type', listing_type, 'applicationId', saved_application_id);
end;
$$;

select
  bm.id,
  bm.business_type,
  bm.business_id,
  bm.media_asset_id,
  bm.caption,
  bm.alt_text,
  bm.sort_order,
  bm.is_cover,
  bm.is_featured,
  bm.media_purpose,
  ma.path,
  ma.filename,
  ma.file_type,
  ma.width,
  ma.height,
  ma.storage_bucket,
  ma.storage_path
from public.business_media bm
join public.media_assets ma on ma.id = bm.media_asset_id
where bm.is_public
  and not ma.archived
  and case
    when bm.business_type = 'property' then exists (
      select 1
      from public.properties p
      where p.id = bm.business_id
        and p.publication_status = 'published'
        and p.verification_status = 'verified'
    )
    when bm.business_type = 'restaurant' then exists (
      select 1
      from public.restaurants r
      where r.id = bm.business_id
        and r.publication_status = 'published'
        and r.verification_status = 'verified'
    )
    when bm.business_type = 'experience' then exists (
      select 1
      from public.experiences e
      where e.id = bm.business_id
        and e.publication_status = 'published'
        and e.verification_status = 'verified'
    )
    when bm.business_type = 'transfer' then exists (
      select 1
      from public.transfers t
      where t.id = bm.business_id
        and t.publication_status = 'published'
        and t.verification_status = 'verified'
    )
    else false
  end;

grant select on public.public_business_media to anon, authenticated;

-- ─── 4. Update admin_save_business_listing to persist restaurant contact fields ─
create or replace function public.admin_save_business_listing(
  admin_user_id uuid, listing_type text, listing_uuid uuid, listing_payload jsonb
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  saved_id uuid;
  saved_application_id uuid;
  target_id uuid := coalesce(listing_uuid, gen_random_uuid());
  base_slug text;
  normalized_business_type text;
begin
  if auth.role() <> 'service_role' then raise exception 'service_role is required'; end if;
  if not exists (select 1 from public.admin_users where auth_user_id = admin_user_id and is_active and role in ('owner','admin')) then
    raise exception 'Save actor is not an active administrator';
  end if;
  if listing_type not in ('transfer','experience','restaurant') then raise exception 'Unsupported listing type'; end if;
  if nullif(trim(listing_payload->>'title'), '') is null then raise exception 'Title is required'; end if;
  if (listing_payload->>'publicationStatus') = 'published' and (listing_payload->>'verificationStatus') <> 'verified' then
    raise exception 'Only verified listings can be published';
  end if;
  base_slug := public.production_slug(listing_payload->>'title');
  normalized_business_type := public.normalize_admin_created_business_type(listing_type, listing_payload);

  if listing_type = 'transfer' then
    if listing_uuid is not null and not exists (select 1 from public.transfers where id = listing_uuid) then raise exception 'Listing UUID does not identify a transfer'; end if;
    if exists (select 1 from public.transfers where slug = base_slug and id <> target_id) then base_slug := base_slug || '-' || left(target_id::text, 8); end if;
    insert into public.transfers (id, slug, title, transfer_type, description, duration, price, departure_point, arrival_point, schedule_note, image_path, publication_status, verification_status, featured)
    values (target_id, base_slug, trim(listing_payload->>'title'), coalesce(nullif(listing_payload->>'transferType',''),'transfer-company'),
      coalesce(listing_payload->>'description',''), listing_payload->>'duration', nullif(listing_payload->>'price',''), listing_payload->>'departurePoint', listing_payload->>'arrivalPoint',
      listing_payload->>'schedule', coalesce(listing_payload->>'image',''), coalesce(listing_payload->>'publicationStatus','draft'), coalesce(listing_payload->>'verificationStatus','pending'), coalesce((listing_payload->>'featured')::boolean,false))
    on conflict (id) do update set title=excluded.title, transfer_type=excluded.transfer_type, description=excluded.description, duration=excluded.duration,
      price=excluded.price, departure_point=excluded.departure_point, arrival_point=excluded.arrival_point, schedule_note=excluded.schedule_note,
      image_path=excluded.image_path, publication_status=excluded.publication_status, verification_status=excluded.verification_status, featured=excluded.featured, updated_at=now()
    returning id into saved_id;

    select public.ensure_admin_listing_application(
      saved_id, 'transfer', trim(listing_payload->>'title'), normalized_business_type, 'Thoddoo',
      coalesce(nullif(listing_payload->>'departurePoint', ''), nullif(listing_payload->>'arrivalPoint', '')),
      coalesce(listing_payload->>'description', ''), '', '', '',
      (select application_id from public.transfers where id = saved_id)
    ) into saved_application_id;
    update public.transfers set application_id = saved_application_id where id = saved_id;

  elsif listing_type = 'experience' then
    if listing_uuid is not null and not exists (select 1 from public.experiences where id = listing_uuid) then raise exception 'Listing UUID does not identify an experience'; end if;
    if exists (select 1 from public.experiences where slug = base_slug and id <> target_id) then base_slug := base_slug || '-' || left(target_id::text, 8); end if;
    insert into public.experiences (id, slug, title, description, category, duration, price, image_path, highlights, publication_status, verification_status, featured)
    values (target_id, base_slug, trim(listing_payload->>'title'), coalesce(listing_payload->>'description',''), coalesce(nullif(listing_payload->>'category',''),'experience'),
      listing_payload->>'duration', nullif(listing_payload->>'price',''), coalesce(listing_payload->>'image',''), regexp_split_to_array(coalesce(listing_payload->>'highlights',''),'\s*\n\s*'),
      coalesce(listing_payload->>'publicationStatus','draft'), coalesce(listing_payload->>'verificationStatus','pending'), coalesce((listing_payload->>'featured')::boolean,false))
    on conflict (id) do update set title=excluded.title, description=excluded.description, category=excluded.category, duration=excluded.duration, price=excluded.price,
      image_path=excluded.image_path, highlights=excluded.highlights, publication_status=excluded.publication_status, verification_status=excluded.verification_status, featured=excluded.featured, updated_at=now()
    returning id into saved_id;

    select public.ensure_admin_listing_application(
      saved_id, 'experience', trim(listing_payload->>'title'), normalized_business_type, 'Thoddoo',
      nullif(listing_payload->>'location', ''), coalesce(listing_payload->>'description', ''), '', '', '',
      (select application_id from public.experiences where id = saved_id)
    ) into saved_application_id;
    update public.experiences set application_id = saved_application_id where id = saved_id;

  else
    -- restaurant
    if listing_uuid is not null and not exists (select 1 from public.restaurants where id = listing_uuid) then raise exception 'Listing UUID does not identify a restaurant'; end if;
    if exists (select 1 from public.restaurants where slug = base_slug and id <> target_id) then base_slug := base_slug || '-' || left(target_id::text, 8); end if;

    insert into public.restaurants (
      id, slug, name, description, cuisine, location, price_range, opening_hours,
      phone, whatsapp, email, website, instagram, facebook,
      address, latitude, longitude,
      image_path, publication_status, verification_status, featured
    )
    values (
      target_id, base_slug, trim(listing_payload->>'title'),
      coalesce(listing_payload->>'description',''),
      regexp_split_to_array(coalesce(listing_payload->>'cuisine',''),'\s*\n\s*'),
      listing_payload->>'location',
      listing_payload->>'price',
      listing_payload->>'openingHours',
      nullif(trim(coalesce(listing_payload->>'phone','')), ''),
      nullif(trim(coalesce(listing_payload->>'whatsapp','')), ''),
      nullif(trim(coalesce(listing_payload->>'email','')), ''),
      nullif(trim(coalesce(listing_payload->>'website','')), ''),
      nullif(trim(coalesce(listing_payload->>'instagram','')), ''),
      nullif(trim(coalesce(listing_payload->>'facebook','')), ''),
      nullif(trim(coalesce(listing_payload->>'address','')), ''),
      case when nullif(trim(coalesce(listing_payload->>'latitude','')), '') is not null
           then (listing_payload->>'latitude')::numeric else null end,
      case when nullif(trim(coalesce(listing_payload->>'longitude','')), '') is not null
           then (listing_payload->>'longitude')::numeric else null end,
      coalesce(listing_payload->>'image',''),
      coalesce(listing_payload->>'publicationStatus','draft'),
      coalesce(listing_payload->>'verificationStatus','pending'),
      coalesce((listing_payload->>'featured')::boolean,false)
    )
    on conflict (id) do update set
      name=excluded.name, description=excluded.description, cuisine=excluded.cuisine,
      location=excluded.location, price_range=excluded.price_range, opening_hours=excluded.opening_hours,
      phone=excluded.phone, whatsapp=excluded.whatsapp, email=excluded.email,
      website=excluded.website, instagram=excluded.instagram, facebook=excluded.facebook,
      address=excluded.address, latitude=excluded.latitude, longitude=excluded.longitude,
      image_path=excluded.image_path, publication_status=excluded.publication_status,
      verification_status=excluded.verification_status, featured=excluded.featured,
      updated_at=now()
    returning id into saved_id;

    select public.ensure_admin_listing_application(
      saved_id, 'restaurant', trim(listing_payload->>'title'), normalized_business_type, 'Thoddoo',
      nullif(listing_payload->>'location', ''), coalesce(listing_payload->>'description', ''),
      coalesce(listing_payload->>'phone', ''), coalesce(listing_payload->>'email', ''), '',
      (select application_id from public.restaurants where id = saved_id)
    ) into saved_application_id;
    update public.restaurants set application_id = saved_application_id where id = saved_id;
  end if;

  return jsonb_build_object('id', saved_id, 'type', listing_type, 'applicationId', saved_application_id);
end;
$$;

