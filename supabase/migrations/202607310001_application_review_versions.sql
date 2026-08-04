-- Versioned admin corrections for partner applications.
-- Additive and data-preserving. Do not apply automatically from application code.

-- Migrations are applied by the database owner, whose local default privileges
-- do not automatically grant PostgREST access to the service_role. Keep all
-- server-side repository access privileged without granting anon/authenticated.
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select, update on all sequences in schema public to service_role;

create table if not exists public.partner_application_review_versions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.partner_applications(id) on delete cascade,
  version integer not null,
  original_values jsonb not null,
  reviewed_values jsonb not null,
  reviewed_prices jsonb not null default '[]'::jsonb,
  edited_by_user_id uuid not null references public.admin_users(auth_user_id) on delete restrict,
  edited_by_name text not null,
  edited_at timestamptz not null default now(),
  unique (application_id, version)
);

alter table public.partner_application_media
  add column if not exists admin_rights_confirmed boolean not null default false,
  add column if not exists public_selected boolean not null default false;

create index if not exists partner_application_review_versions_application_idx
  on public.partner_application_review_versions(application_id, version desc);

alter table public.partner_application_review_versions enable row level security;
revoke all on public.partner_application_review_versions from public, anon, authenticated;
grant select, insert on public.partner_application_review_versions to service_role;

create or replace function public.admin_save_application_review(
  application_uuid uuid,
  reviewer_user_id uuid,
  reviewer_name text,
  review_payload jsonb,
  price_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  app public.partner_applications%rowtype;
  common jsonb := coalesce(review_payload->'common', '{}'::jsonb);
  category jsonb := coalesce(review_payload->'category', '{}'::jsonb);
  original_snapshot jsonb;
  next_version integer;
  price_item jsonb;
  existing_price_id uuid;
begin
  if auth.role() <> 'service_role' then raise exception 'service_role is required'; end if;
  if not exists (select 1 from public.admin_users where auth_user_id = reviewer_user_id and is_active and role in ('owner', 'admin')) then
    raise exception 'Review actor is not an active administrator';
  end if;

  select * into app from public.partner_applications where id = application_uuid for update;
  if not found then raise exception 'Application not found'; end if;
  if app.status in ('approved', 'rejected', 'withdrawn') then raise exception 'A closed application must be reopened before editing'; end if;
  if nullif(trim(common->>'businessName'), '') is null then raise exception 'Business name is required'; end if;
  if nullif(trim(common->>'contactPerson'), '') is null then raise exception 'Owner or contact is required'; end if;
  if nullif(trim(common->>'email'), '') is null then raise exception 'Email is required'; end if;

  select original_values into original_snapshot
  from public.partner_application_review_versions
  where application_id = application_uuid order by version limit 1;
  original_snapshot := coalesce(original_snapshot, to_jsonb(app));
  select coalesce(max(version), 0) + 1 into next_version
  from public.partner_application_review_versions where application_id = application_uuid;

  insert into public.partner_application_review_versions (
    application_id, version, original_values, reviewed_values, reviewed_prices,
    edited_by_user_id, edited_by_name
  ) values (
    application_uuid, next_version, original_snapshot, review_payload, coalesce(price_payload, '[]'::jsonb),
    reviewer_user_id, trim(reviewer_name)
  );

  update public.partner_applications set
    business_name = trim(common->>'businessName'),
    contact_person = trim(common->>'contactPerson'),
    whatsapp = trim(coalesce(common->>'whatsapp', whatsapp)),
    email = lower(trim(common->>'email')),
    website = nullif(trim(common->>'website'), ''),
    island = trim(coalesce(common->>'island', island)),
    address = nullif(trim(common->>'address'), ''),
    google_maps_link = nullif(trim(common->>'googleMaps'), ''),
    short_description = trim(coalesce(common->>'shortDescription', short_description)),
    membership_plan = lower(trim(coalesce(common->>'membership', membership_plan))),
    metadata = jsonb_set(
      jsonb_set(
        jsonb_set(coalesce(metadata, '{}'::jsonb), '{fullDescription}', to_jsonb(coalesce(common->>'fullDescription', metadata->>'fullDescription', ''))),
        '{categoryAnswers}', category
      ),
      '{adminReview}', jsonb_build_object(
        'version', next_version,
        'category', category,
        'verificationNotes', coalesce(review_payload->>'verificationNotes', ''),
        'publicMediaIds', coalesce(review_payload->'publicMediaIds', '[]'::jsonb),
        'mediaRightsConfirmed', coalesce((review_payload->>'mediaRightsConfirmed')::boolean, false),
        'editedAt', now(),
        'editedBy', trim(reviewer_name)
      )
    ),
    reviewed_at = now(), reviewed_by = trim(reviewer_name), updated_at = now()
  where id = application_uuid;

  update public.partner_application_media
  set admin_rights_confirmed = false, public_selected = false
  where application_id = application_uuid;

  update public.partner_application_media media
  set admin_rights_confirmed = true, public_selected = true
  where media.application_id = application_uuid
    and media.id in (
      select value::uuid
      from jsonb_array_elements_text(coalesce(review_payload->'publicMediaIds', '[]'::jsonb))
    )
    and coalesce((review_payload->>'mediaRightsConfirmed')::boolean, false);

  update public.partner_application_prices set active = false where application_id = application_uuid;
  for price_item in select value from jsonb_array_elements(coalesce(price_payload, '[]'::jsonb)) loop
    if nullif(trim(price_item->>'name'), '') is null then raise exception 'Price item name is required'; end if;
    if nullif(price_item->>'price', '') is not null and (price_item->>'price')::numeric <= 0 then raise exception 'Price must be positive or null'; end if;
    select id into existing_price_id from public.partner_application_prices
      where application_id = application_uuid
        and item_name = trim(price_item->>'name')
        and unit = trim(price_item->>'unit')
      order by created_at desc limit 1;
    if existing_price_id is null then
      insert into public.partner_application_prices (application_id, item_name, price, currency, unit, active, sort_order)
      values (application_uuid, trim(price_item->>'name'), nullif(price_item->>'price', '')::numeric,
        case when price_item->>'currency' = 'MVR' then 'MVR' else 'USD' end,
        trim(price_item->>'unit'), true, next_version * 100);
    else
      update public.partner_application_prices set
        price = nullif(price_item->>'price', '')::numeric,
        currency = case when price_item->>'currency' = 'MVR' then 'MVR' else 'USD' end,
        active = true,
        sort_order = next_version * 100
      where id = existing_price_id;
    end if;
    existing_price_id := null;
  end loop;

  return jsonb_build_object('applicationId', application_uuid, 'version', next_version, 'editedAt', now());
end;
$$;

revoke all on function public.admin_save_application_review(uuid, uuid, text, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.admin_save_application_review(uuid, uuid, text, jsonb, jsonb) to service_role;

comment on function public.admin_save_application_review(uuid, uuid, text, jsonb, jsonb)
  is 'Locks and versions an admin application correction, then updates the approval input snapshot transactionally.';

alter table public.restaurants add column if not exists application_id uuid references public.partner_applications(id) on delete set null,
  add column if not exists partner_id uuid references public.partners(id) on delete cascade,
  add column if not exists verification_status text not null default 'pending';
alter table public.experiences add column if not exists application_id uuid references public.partner_applications(id) on delete set null,
  add column if not exists partner_id uuid references public.partners(id) on delete cascade,
  add column if not exists verification_status text not null default 'pending';
alter table public.transfers add column if not exists application_id uuid references public.partner_applications(id) on delete set null,
  add column if not exists partner_id uuid references public.partners(id) on delete cascade,
  add column if not exists verification_status text not null default 'pending';
alter table public.partner_applications add column if not exists listing_id uuid,
  add column if not exists listing_type text;
create unique index if not exists restaurants_application_id_key on public.restaurants(application_id) where application_id is not null;
create unique index if not exists experiences_application_id_key on public.experiences(application_id) where application_id is not null;
create unique index if not exists transfers_application_id_key on public.transfers(application_id) where application_id is not null;

create or replace function public.approve_partner_application_all_types(
  application_uuid uuid, reviewer_user_id uuid, reviewer_name text,
  publish_listing boolean default false, review_note text default null
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  base_result jsonb;
  app public.partner_applications%rowtype;
  answers jsonb;
  saved_listing_id uuid;
  listing_slug text;
  price_text text;
  hero_path text;
begin
  select * into app from public.partner_applications where id = application_uuid;
  if not found then raise exception 'Application not found'; end if;
  answers := coalesce(app.metadata->'categoryAnswers', '{}'::jsonb);
  if publish_listing and exists (
    select 1 from public.partner_application_media
    where application_id = app.id and media_type in ('logo','cover','hero','gallery','service')
      and nullif(path_or_note, '') is not null and status <> 'rejected'
  ) and not exists (
    select 1 from public.partner_application_media
    where application_id = app.id and admin_rights_confirmed and public_selected
  ) then raise exception 'Select public media and confirm publication rights before publishing'; end if;
  -- The already-applied core function captures only the hour from HH:MM before
  -- casting to time. Keep reviewed values authoritative but omit those keys
  -- during the legacy call, then persist validated values below.
  if app.business_type in ('guesthouse', 'hotel') then
    update public.partner_applications
    set metadata = jsonb_set(
      metadata,
      '{categoryAnswers}',
      answers - 'checkInTime' - 'checkOutTime' - 'checkInOut'
    )
    where id = app.id;
  end if;
  base_result := public.approve_partner_application(application_uuid, reviewer_user_id, reviewer_name, publish_listing, review_note);
  if app.business_type in ('guesthouse', 'hotel') then
    update public.partner_applications
    set metadata = jsonb_set(metadata, '{categoryAnswers}', answers)
    where id = app.id;
    update public.properties
    set check_in_time = case when coalesce(answers->>'checkInTime', '') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then (answers->>'checkInTime')::time else check_in_time end,
        check_out_time = case when coalesce(answers->>'checkOutTime', '') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then (answers->>'checkOutTime')::time else check_out_time end
    where id = nullif(base_result->>'propertyId', '')::uuid;
  end if;
  if app.business_type in ('guesthouse', 'hotel') and not exists (
    select 1 from public.partner_application_prices where application_id = app.id and active and unit = 'per night'
  ) then raise exception 'At least one structured room is required'; end if;
  if app.business_type in ('speedboat-company', 'ferry-operator', 'transfer-company')
    and (nullif(trim(answers->>'departurePoint'), '') is null or nullif(trim(answers->>'arrivalPoint'), '') is null)
  then raise exception 'Transfer departure and arrival are required'; end if;
  if app.business_type in ('excursion-operator', 'dive-center', 'watersports', 'photographer', 'farm-experience', 'local-guide')
    and nullif(trim(coalesce(answers->>'activityName', app.business_name)), '') is null
  then raise exception 'Experience title is required'; end if;
  if app.business_type in ('restaurant', 'cafe')
    and (nullif(trim(answers->>'cuisine'), '') is null or nullif(trim(answers->>'openingHours'), '') is null)
  then raise exception 'Restaurant cuisine and opening hours are required'; end if;
  listing_slug := public.production_slug(app.business_name);
  select concat(currency, ' ', price, ' ', unit) into price_text from public.partner_application_prices
    where application_id = app.id and active and price > 0 order by sort_order limit 1;
  select path_or_note into hero_path from public.partner_application_media
    where application_id = app.id and media_type in ('hero', 'cover', 'gallery')
      and admin_rights_confirmed and public_selected and status <> 'rejected'
    order by sort_order limit 1;

  if app.business_type in ('restaurant', 'cafe') then
    if exists (select 1 from public.restaurants where slug = listing_slug and application_id is distinct from app.id) then
      listing_slug := listing_slug || '-' || left(app.id::text, 8);
    end if;
    insert into public.restaurants (application_id, partner_id, slug, name, description, cuisine, location, price_range, opening_hours, image_path, publication_status, verification_status)
    values (app.id, app.partner_id, listing_slug, app.business_name, app.short_description,
      regexp_split_to_array(coalesce(answers->>'cuisine', ''), '\s*(?:,|;|\n)\s*'), coalesce(app.address, app.island),
      coalesce(answers->>'averagePrice', price_text), answers->>'openingHours', coalesce(hero_path, ''),
      case when publish_listing then 'published' else 'draft' end, 'verified')
    on conflict (application_id) where application_id is not null do update set
      name = excluded.name, description = excluded.description, cuisine = excluded.cuisine, location = excluded.location,
      price_range = excluded.price_range, opening_hours = excluded.opening_hours, image_path = excluded.image_path,
      publication_status = case when publish_listing then 'published' else public.restaurants.publication_status end,
      verification_status = 'verified', updated_at = now()
    returning id into saved_listing_id;
  elsif app.business_type in ('speedboat-company', 'ferry-operator', 'transfer-company') then
    if exists (select 1 from public.transfers where slug = listing_slug and application_id is distinct from app.id) then
      listing_slug := listing_slug || '-' || left(app.id::text, 8);
    end if;
    insert into public.transfers (application_id, partner_id, slug, title, transfer_type, description, duration, price, departure_point, arrival_point, schedule_note, image_path, highlights, publication_status, verification_status)
    values (app.id, app.partner_id, listing_slug, app.business_name, app.business_type, app.short_description,
      answers->>'duration', coalesce(price_text, 'Price on request'), answers->>'departurePoint', answers->>'arrivalPoint', answers->>'schedule', coalesce(hero_path, ''),
      array_remove(array[answers->>'routes', answers->>'luggage', answers->>'pickupDropoff'], null),
      case when publish_listing then 'published' else 'draft' end, 'verified')
    on conflict (application_id) where application_id is not null do update set
      title = excluded.title, description = excluded.description, duration = excluded.duration, price = excluded.price,
      departure_point = excluded.departure_point, arrival_point = excluded.arrival_point, schedule_note = excluded.schedule_note,
      image_path = excluded.image_path, highlights = excluded.highlights,
      publication_status = case when publish_listing then 'published' else public.transfers.publication_status end,
      verification_status = 'verified', updated_at = now()
    returning id into saved_listing_id;
  elsif app.business_type in ('excursion-operator', 'dive-center', 'watersports', 'photographer', 'farm-experience', 'local-guide') then
    if exists (select 1 from public.experiences where slug = listing_slug and application_id is distinct from app.id) then
      listing_slug := listing_slug || '-' || left(app.id::text, 8);
    end if;
    insert into public.experiences (application_id, partner_id, slug, title, description, category, duration, price, image_path, highlights, publication_status, verification_status)
    values (app.id, app.partner_id, listing_slug, coalesce(nullif(answers->>'activityName', ''), app.business_name), app.short_description,
      coalesce(nullif(answers->>'activityCategory', ''), app.business_type), answers->>'duration', coalesce(price_text, 'Price on request'), coalesce(hero_path, ''),
      regexp_split_to_array(coalesce(answers->>'includedItems', ''), '\s*(?:,|;|\n)\s*'),
      case when publish_listing then 'published' else 'draft' end, 'verified')
    on conflict (application_id) where application_id is not null do update set
      title = excluded.title, description = excluded.description, category = excluded.category, duration = excluded.duration,
      price = excluded.price, image_path = excluded.image_path, highlights = excluded.highlights,
      publication_status = case when publish_listing then 'published' else public.experiences.publication_status end,
      verification_status = 'verified', updated_at = now()
    returning id into saved_listing_id;
  end if;

  insert into public.partner_service_items (
    partner_id, property_id, application_id, source_key, service_type, title,
    description, price, currency, unit, child_price, notes, active, sort_order, public_visible, metadata
  )
  select app.partner_id, null, app.id, 'price:' || p.id, app.business_type, p.item_name,
    p.description, p.price, p.currency, p.unit, p.child_price, p.notes, p.active, p.sort_order, true,
    jsonb_build_object('listingId', saved_listing_id, 'applicationPriceId', p.id)
  from public.partner_application_prices p
  where p.application_id = app.id and p.active and app.business_type not in ('guesthouse', 'hotel')
  on conflict (application_id, source_key) where application_id is not null and source_key is not null
  do update set title=excluded.title, description=excluded.description, price=excluded.price,
    currency=excluded.currency, unit=excluded.unit, child_price=excluded.child_price,
    notes=excluded.notes, active=excluded.active, public_visible=excluded.public_visible,
    metadata=excluded.metadata;

  insert into public.media_assets (
    application_id, partner_id, property_id, filename, path, storage_path, category,
    media_type, file_type, alt_text, caption, rights_status, archived, sort_order, visibility
  )
  select app.id, app.partner_id, null,
    coalesce(nullif(m.file_name, ''), regexp_replace(m.path_or_note, '^.*/', '')),
    m.path_or_note, m.path_or_note, initcap(m.media_type), m.media_type, 'image/jpeg',
    app.business_name || ' ' || m.label, m.label, 'permission_confirmed', false, m.sort_order, 'public'
  from public.partner_application_media m
  where m.application_id = app.id
    and m.media_type in ('logo', 'cover', 'hero', 'gallery', 'service')
    and nullif(m.path_or_note, '') is not null and m.status <> 'rejected'
    and m.admin_rights_confirmed and m.public_selected
    and app.business_type not in ('guesthouse', 'hotel')
  on conflict (path) do update set
    application_id=excluded.application_id, partner_id=excluded.partner_id,
    media_type=excluded.media_type, sort_order=excluded.sort_order,
    rights_status='permission_confirmed', visibility='public', archived=false
  where public.media_assets.application_id = app.id
    or (public.media_assets.application_id is null and public.media_assets.partner_id is null and public.media_assets.property_id is null);

  -- The core accommodation approval predates explicit media review. Reconcile
  -- its result so unselected or unconfirmed application media cannot remain public.
  update public.media_assets asset
  set visibility = 'private', rights_status = 'needs_confirmation'
  where asset.application_id = app.id
    and not exists (
      select 1 from public.partner_application_media media
      where media.application_id = app.id
        and media.path_or_note = asset.path
        and media.admin_rights_confirmed
        and media.public_selected
        and media.status <> 'rejected'
    );

  delete from public.property_media link
  using public.media_assets asset
  where link.media_asset_id = asset.id
    and asset.application_id = app.id
    and asset.visibility <> 'public';

  if saved_listing_id is not null then
    update public.partner_applications set listing_id = saved_listing_id,
      listing_type = case when business_type in ('restaurant','cafe') then 'restaurant'
        when business_type in ('speedboat-company','ferry-operator','transfer-company') then 'transfer'
        else 'experience' end,
      updated_at = now()
    where id = app.id;
  end if;

  return base_result || jsonb_build_object('listingId', coalesce(saved_listing_id, (base_result->>'propertyId')::uuid), 'listingWorkflow',
    case when app.business_type in ('guesthouse','hotel') then 'property'
         when app.business_type in ('restaurant','cafe') then 'restaurant'
         when app.business_type in ('speedboat-company','ferry-operator','transfer-company') then 'transfer'
         else 'experience' end);
end;
$$;
revoke all on function public.approve_partner_application_all_types(uuid, uuid, text, boolean, text) from public, anon, authenticated;
grant execute on function public.approve_partner_application_all_types(uuid, uuid, text, boolean, text) to service_role;

create or replace view public.public_transfers with (security_invoker = true) as
  select id, slug, title, transfer_type, description, duration, price, departure_point, arrival_point, schedule_note, image_path, highlights, featured, created_at, updated_at
  from public.transfers where publication_status = 'published' and verification_status = 'verified';
create or replace view public.public_experiences with (security_invoker = true) as
  select id, slug, title, description, category, duration, price, image_path, highlights, featured, created_at, updated_at
  from public.experiences where publication_status = 'published' and verification_status = 'verified';
create or replace view public.public_restaurants with (security_invoker = true) as
  select id, slug, name, description, cuisine, location, price_range, opening_hours, image_path, featured, created_at, updated_at
  from public.restaurants where publication_status = 'published' and verification_status = 'verified';
grant select on public.public_transfers, public.public_experiences, public.public_restaurants to anon, authenticated;

create or replace function public.admin_save_business_listing(
  admin_user_id uuid, listing_type text, listing_uuid uuid, listing_payload jsonb
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  saved_id uuid;
  target_id uuid := coalesce(listing_uuid, gen_random_uuid());
  base_slug text;
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
  else
    if listing_uuid is not null and not exists (select 1 from public.restaurants where id = listing_uuid) then raise exception 'Listing UUID does not identify a restaurant'; end if;
    if exists (select 1 from public.restaurants where slug = base_slug and id <> target_id) then base_slug := base_slug || '-' || left(target_id::text, 8); end if;
    insert into public.restaurants (id, slug, name, description, cuisine, location, price_range, opening_hours, image_path, publication_status, verification_status, featured)
    values (target_id, base_slug, trim(listing_payload->>'title'), coalesce(listing_payload->>'description',''), regexp_split_to_array(coalesce(listing_payload->>'cuisine',''),'\s*\n\s*'),
      listing_payload->>'location', listing_payload->>'price', listing_payload->>'openingHours', coalesce(listing_payload->>'image',''),
      coalesce(listing_payload->>'publicationStatus','draft'), coalesce(listing_payload->>'verificationStatus','pending'), coalesce((listing_payload->>'featured')::boolean,false))
    on conflict (id) do update set name=excluded.name, description=excluded.description, cuisine=excluded.cuisine, location=excluded.location,
      price_range=excluded.price_range, opening_hours=excluded.opening_hours, image_path=excluded.image_path, publication_status=excluded.publication_status,
      verification_status=excluded.verification_status, featured=excluded.featured, updated_at=now()
    returning id into saved_id;
  end if;
  return jsonb_build_object('id', saved_id, 'type', listing_type);
end;
$$;
revoke all on function public.admin_save_business_listing(uuid, text, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.admin_save_business_listing(uuid, text, uuid, jsonb) to service_role;
