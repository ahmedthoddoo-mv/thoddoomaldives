-- Add restaurant source-menu visibility and promotion fields.
-- These support hiding the original PDF/menu by default while keeping it stored.

alter table public.restaurants
  add column if not exists show_original_menu boolean not null default false,
  add column if not exists promotion_title text,
  add column if not exists promotion_description text,
  add column if not exists promotion_media_url text,
  add column if not exists promotion_cta_label text,
  add column if not exists promotion_cta_destination text,
  add column if not exists promotion_active boolean not null default false,
  add column if not exists promotion_start_date timestamptz,
  add column if not exists promotion_end_date timestamptz,
  add column if not exists promotion_sort_order integer not null default 0;

drop view if exists public.public_restaurants;

create view public.public_restaurants with (security_invoker = true) as
  select
    id, slug, name, description, cuisine,
    location, price_range, opening_hours,
    phone, whatsapp, email, website, instagram, facebook,
    address, latitude, longitude,
    image_path, featured,
    publication_status, verification_status,
    show_original_menu,
    promotion_title, promotion_description, promotion_media_url,
    promotion_cta_label, promotion_cta_destination, promotion_active,
    promotion_start_date, promotion_end_date, promotion_sort_order,
    application_id, partner_id,
    created_at, updated_at
  from public.restaurants
  where publication_status = 'published'
    and verification_status = 'verified';

grant select on public.public_restaurants to anon, authenticated;

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
      listing_payload->>'duration', nullif(listing_payload->>'price',''), coalesce(listing_payload->>'image',''), regexp_split_to_array(coalesce(listing_payload->>'highlights',''), '\s*\n\s*'),
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
    if listing_uuid is not null and not exists (select 1 from public.restaurants where id = listing_uuid) then raise exception 'Listing UUID does not identify a restaurant'; end if;
    if exists (select 1 from public.restaurants where slug = base_slug and id <> target_id) then base_slug := base_slug || '-' || left(target_id::text, 8); end if;

    insert into public.restaurants (
      id, slug, name, description, cuisine, location, price_range, opening_hours,
      phone, whatsapp, email, website, instagram, facebook,
      address, latitude, longitude,
      image_path, publication_status, verification_status, featured,
      show_original_menu, promotion_title, promotion_description, promotion_media_url,
      promotion_cta_label, promotion_cta_destination, promotion_active,
      promotion_start_date, promotion_end_date, promotion_sort_order
    )
    values (
      target_id, base_slug, trim(listing_payload->>'title'),
      coalesce(listing_payload->>'description',''),
      regexp_split_to_array(coalesce(listing_payload->>'cuisine',''), '\s*\n\s*'),
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
      case when nullif(trim(coalesce(listing_payload->>'latitude','')), '') is not null then (listing_payload->>'latitude')::numeric else null end,
      case when nullif(trim(coalesce(listing_payload->>'longitude','')), '') is not null then (listing_payload->>'longitude')::numeric else null end,
      coalesce(listing_payload->>'image',''),
      coalesce(listing_payload->>'publicationStatus','draft'),
      coalesce(listing_payload->>'verificationStatus','pending'),
      coalesce((listing_payload->>'featured')::boolean,false),
      coalesce((listing_payload->>'showOriginalMenu')::boolean,false),
      nullif(trim(coalesce(listing_payload->>'promotionTitle','')), ''),
      nullif(trim(coalesce(listing_payload->>'promotionDescription','')), ''),
      nullif(trim(coalesce(listing_payload->>'promotionMediaUrl','')), ''),
      nullif(trim(coalesce(listing_payload->>'promotionCtaLabel','')), ''),
      nullif(trim(coalesce(listing_payload->>'promotionCtaDestination','')), ''),
      coalesce((listing_payload->>'promotionActive')::boolean,false),
      case when nullif(trim(coalesce(listing_payload->>'promotionStartDate','')), '') is not null then (listing_payload->>'promotionStartDate')::timestamptz else null end,
      case when nullif(trim(coalesce(listing_payload->>'promotionEndDate','')), '') is not null then (listing_payload->>'promotionEndDate')::timestamptz else null end,
      case when nullif(trim(coalesce(listing_payload->>'promotionSortOrder','0')), '') is not null then (listing_payload->>'promotionSortOrder')::integer else 0 end
    )
    on conflict (id) do update set
      name=excluded.name, description=excluded.description, cuisine=excluded.cuisine,
      location=excluded.location, price_range=excluded.price_range, opening_hours=excluded.opening_hours,
      phone=excluded.phone, whatsapp=excluded.whatsapp, email=excluded.email,
      website=excluded.website, instagram=excluded.instagram, facebook=excluded.facebook,
      address=excluded.address, latitude=excluded.latitude, longitude=excluded.longitude,
      image_path=excluded.image_path, publication_status=excluded.publication_status,
      verification_status=excluded.verification_status, featured=excluded.featured,
      show_original_menu=excluded.show_original_menu,
      promotion_title=excluded.promotion_title,
      promotion_description=excluded.promotion_description,
      promotion_media_url=excluded.promotion_media_url,
      promotion_cta_label=excluded.promotion_cta_label,
      promotion_cta_destination=excluded.promotion_cta_destination,
      promotion_active=excluded.promotion_active,
      promotion_start_date=excluded.promotion_start_date,
      promotion_end_date=excluded.promotion_end_date,
      promotion_sort_order=excluded.promotion_sort_order,
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
