-- Phase 1 production partner/property/enquiry foundation.
-- Additive and data-preserving. Historical migrations are intentionally untouched.

alter table public.partner_applications
  add column if not exists property_id uuid references public.properties(id) on delete set null,
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by_user_id uuid references public.admin_users(auth_user_id) on delete set null;

alter table public.partners
  add column if not exists application_id uuid references public.partner_applications(id) on delete set null,
  add column if not exists phone text,
  add column if not exists full_description text,
  add column if not exists logo_path text,
  add column if not exists hero_image_path text,
  add column if not exists gallery_paths text[] not null default '{}'::text[],
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by_user_id uuid references public.admin_users(auth_user_id) on delete set null,
  add column if not exists published_at timestamptz;

alter table public.properties
  add column if not exists application_id uuid references public.partner_applications(id) on delete set null,
  add column if not exists phone text,
  add column if not exists logo_path text,
  add column if not exists room_count integer,
  add column if not exists starting_price numeric(12, 2),
  add column if not exists currency text,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by_user_id uuid references public.admin_users(auth_user_id) on delete set null,
  add column if not exists published_at timestamptz;

alter table public.rooms
  alter column price_per_night drop not null,
  alter column price_per_night drop default,
  add column if not exists source_key text,
  add column if not exists currency text,
  add column if not exists amenities text[] not null default '{}'::text[],
  add column if not exists image_paths text[] not null default '{}'::text[],
  add column if not exists metadata jsonb not null default '{}'::jsonb;

-- Historical zeroes represented unknown prices. Normalize before validating
-- the new positive-or-null invariant so existing rows cannot abort migration.
update public.rooms set price_per_night = null where price_per_night = 0;

alter table public.partner_service_items
  add column if not exists application_id uuid references public.partner_applications(id) on delete set null,
  add column if not exists source_key text,
  add column if not exists public_visible boolean not null default true;

alter table public.media_assets
  add column if not exists application_id uuid references public.partner_applications(id) on delete set null,
  add column if not exists partner_id uuid references public.partners(id) on delete cascade,
  add column if not exists property_id uuid references public.properties(id) on delete cascade,
  add column if not exists room_id uuid references public.rooms(id) on delete cascade,
  add column if not exists storage_bucket text,
  add column if not exists storage_path text,
  add column if not exists media_type text,
  add column if not exists sort_order integer not null default 0,
  add column if not exists visibility text not null default 'private';

alter table public.partner_account_invitations
  add column if not exists idempotency_key uuid not null default gen_random_uuid(),
  add column if not exists delivery_attempted_at timestamptz,
  add column if not exists delivery_error text;

alter table public.partner_account_invitations
  drop constraint if exists partner_account_invitations_status_check;
alter table public.partner_account_invitations
  add constraint partner_account_invitations_status_check
  check (status in ('preview', 'sending', 'sent', 'accepted', 'expired', 'cancelled'));

alter table public.bookings
  alter column booking_total drop not null,
  alter column booking_total drop default,
  alter column company_revenue drop not null,
  alter column company_revenue drop default,
  alter column partner_revenue drop not null,
  alter column partner_revenue drop default,
  add column if not exists nights integer,
  add column if not exists source text not null default 'website_enquiry',
  add column if not exists selected_service_ids uuid[] not null default '{}'::uuid[],
  add column if not exists quoted_amount numeric(12, 2),
  add column if not exists quote_currency text;

create index if not exists partner_applications_property_id_idx on public.partner_applications(property_id);
create index if not exists partner_applications_approved_by_user_id_idx
  on public.partner_applications(approved_by_user_id);
create unique index if not exists partners_application_id_key
  on public.partners(application_id) where application_id is not null;
create index if not exists partners_approved_by_user_id_idx
  on public.partners(approved_by_user_id);
create unique index if not exists properties_application_id_key
  on public.properties(application_id) where application_id is not null;
create index if not exists properties_approved_by_user_id_idx
  on public.properties(approved_by_user_id);
create unique index if not exists rooms_property_source_key
  on public.rooms(property_id, source_key) where source_key is not null;
create unique index if not exists partner_service_items_application_source_key
  on public.partner_service_items(application_id, source_key) where application_id is not null and source_key is not null;
create index if not exists partner_service_items_application_id_idx
  on public.partner_service_items(application_id);
with ranked_invitations as (
  select id, row_number() over (
    partition by application_id
    order by case status when 'accepted' then 0 when 'sent' then 1 else 2 end, created_at, id
  ) as duplicate_rank
  from public.partner_account_invitations
  where application_id is not null and status <> 'cancelled'
)
update public.partner_account_invitations invitation
set status = 'cancelled',
    notes = concat_ws(' ', invitation.notes, 'Superseded by an earlier invitation during production workflow migration.')
from ranked_invitations ranked
where invitation.id = ranked.id and ranked.duplicate_rank > 1;
create unique index if not exists partner_account_invitations_application_key
  on public.partner_account_invitations(application_id)
  where application_id is not null and status <> 'cancelled';
create index if not exists media_assets_property_visibility_idx on public.media_assets(property_id, visibility, archived);
create index if not exists media_assets_room_id_idx on public.media_assets(room_id);
create index if not exists media_assets_application_id_idx on public.media_assets(application_id);
create index if not exists media_assets_partner_id_idx on public.media_assets(partner_id);
create index if not exists bookings_reference_property_idx on public.bookings(booking_reference, property_id);
create unique index if not exists partner_account_invitations_idempotency_key_idx
  on public.partner_account_invitations(idempotency_key);
create unique index if not exists partner_service_items_property_source_key
  on public.partner_service_items(property_id, source_key)
  where property_id is not null and source_key is not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'properties_starting_price_positive_check') then
    alter table public.properties add constraint properties_starting_price_positive_check
      check (starting_price is null or starting_price > 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'rooms_price_positive_or_unknown_check') then
    alter table public.rooms add constraint rooms_price_positive_or_unknown_check
      check (price_per_night is null or price_per_night > 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'media_assets_visibility_check') then
    alter table public.media_assets add constraint media_assets_visibility_check
      check (visibility in ('public', 'private'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'bookings_enquiry_values_check') then
    alter table public.bookings add constraint bookings_enquiry_values_check
      check (
        (nights is null or nights > 0)
        and (quoted_amount is null or quoted_amount > 0)
        and adults >= 1
        and children >= 0
      );
  end if;
end $$;

create or replace function public.normalized_business_identity(value text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select trim(regexp_replace(lower(value), '[^a-z0-9]+', ' ', 'g'));
$$;

create or replace function public.production_slug(value text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select trim(both '-' from regexp_replace(lower(value), '[^a-z0-9]+', '-', 'g'));
$$;

create sequence if not exists public.partner_application_reference_seq;

create or replace function public.next_partner_application_reference()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate text;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service_role is required';
  end if;
  loop
    candidate := 'ITM-APP-' || extract(year from now())::integer || '-'
      || lpad(nextval('public.partner_application_reference_seq')::text, 6, '0');
    exit when not exists (
      select 1 from public.partner_applications where application_reference = candidate
    );
  end loop;
  return candidate;
end;
$$;

revoke all on function public.next_partner_application_reference() from public, anon, authenticated;
grant execute on function public.next_partner_application_reference() to service_role;
comment on function public.next_partner_application_reference()
  is 'Service-role-only, sequence-backed generation of collision-safe human-readable partner application references.';

create or replace function public.approve_partner_application(
  application_uuid uuid,
  reviewer_user_id uuid,
  reviewer_name text,
  publish_listing boolean default false,
  review_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  app public.partner_applications%rowtype;
  partner_row public.partners%rowtype;
  property_row public.properties%rowtype;
  answers jsonb;
  membership_uuid uuid;
  base_slug text;
  candidate_slug text;
  suffix integer := 2;
  room_names text[];
  room_name text;
  room_price public.partner_application_prices%rowtype;
  room_index integer := 0;
  now_value timestamptz := now();
  is_accommodation boolean;
  amenities_value text[];
  policies_value text[];
  first_price numeric(12, 2);
  first_currency text;
  hero_path text;
  logo_path_value text;
  gallery_value text[];
  result jsonb;
begin
  if not exists (
    select 1
    from public.admin_users
    where auth_user_id = reviewer_user_id
      and is_active
      and role in ('owner', 'admin')
  ) then
    raise exception 'Approval actor is not an active administrator';
  end if;

  if auth.role() <> 'service_role' then
    raise exception 'service_role is required';
  end if;

  select * into app
  from public.partner_applications
  where id = application_uuid
  for update;
  if not found then raise exception 'Application not found'; end if;

  answers := coalesce(app.metadata->'categoryAnswers', '{}'::jsonb);
  is_accommodation := app.business_type in ('guesthouse', 'hotel');

  select id into membership_uuid
  from public.membership_plans
  where lower(name) = lower(app.membership_plan)
  order by active desc
  limit 1;

  select * into partner_row from public.partners where id = app.partner_id;
  if partner_row.id is null then
    select * into partner_row from public.partners where application_id = app.id limit 1;
  end if;
  if partner_row.id is null then
    select * into partner_row
    from public.partners
    where lower(coalesce(email, '')) = lower(app.email)
      and public.normalized_business_identity(business_name) = public.normalized_business_identity(app.business_name)
    order by created_at
    limit 1;
  end if;
  if partner_row.id is null then
    select * into partner_row
    from public.partners
    where public.normalized_business_identity(business_name) = public.normalized_business_identity(app.business_name)
      and category = app.business_type
    order by created_at
    limit 1;
  end if;

  base_slug := nullif(public.production_slug(app.business_name), '');
  if base_slug is null then base_slug := 'partner'; end if;
  candidate_slug := base_slug;
  while exists (
    select 1 from public.partners
    where slug = candidate_slug and id is distinct from partner_row.id
  ) loop
    candidate_slug := base_slug || '-' || suffix;
    suffix := suffix + 1;
  end loop;

  if partner_row.id is null then
    insert into public.partners (
      application_id, business_name, slug, owner_name, category, status,
      membership_plan_id, verification_status, whatsapp, email, website, address,
      island, google_maps_link, instagram, facebook, short_description,
      full_description, registration_number, lead_source, priority, metadata,
      approved_at, approved_by_user_id
    ) values (
      app.id, app.business_name, candidate_slug, app.contact_person, app.business_type, 'verified',
      membership_uuid, 'verified', app.whatsapp, lower(app.email), app.website, app.address,
      app.island, app.google_maps_link, app.instagram, app.facebook, app.short_description,
      nullif(app.metadata->>'fullDescription', ''), app.registration_number,
      'Application ' || coalesce(app.application_reference, app.id::text), 'high',
      jsonb_build_object('applicationSnapshot', app.metadata, 'membership', app.membership_plan),
      now_value, reviewer_user_id
    ) returning * into partner_row;
  else
    update public.partners set
      application_id = coalesce(application_id, app.id),
      business_name = app.business_name,
      owner_name = app.contact_person,
      category = app.business_type,
      status = 'verified',
      membership_plan_id = coalesce(membership_uuid, membership_plan_id),
      verification_status = 'verified',
      whatsapp = app.whatsapp,
      email = lower(app.email),
      website = coalesce(nullif(app.website, ''), website),
      address = coalesce(nullif(app.address, ''), address),
      island = coalesce(nullif(app.island, ''), island),
      google_maps_link = coalesce(nullif(app.google_maps_link, ''), google_maps_link),
      instagram = coalesce(nullif(app.instagram, ''), instagram),
      facebook = coalesce(nullif(app.facebook, ''), facebook),
      short_description = coalesce(nullif(app.short_description, ''), short_description),
      full_description = coalesce(nullif(app.metadata->>'fullDescription', ''), full_description),
      registration_number = coalesce(nullif(app.registration_number, ''), registration_number),
      metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
        'applicationSnapshot', app.metadata, 'membership', app.membership_plan
      ),
      approved_at = coalesce(approved_at, now_value),
      approved_by_user_id = coalesce(approved_by_user_id, reviewer_user_id)
    where id = partner_row.id returning * into partner_row;
  end if;

  -- Verification documents stay private and are linked without exposing storage paths.
  insert into public.partner_documents (
    partner_id, property_id, document_key, document_label, category, required,
    storage_bucket, storage_path, file_name, status, uploaded_at, reviewed_at, reviewed_by
  )
  select
    partner_row.id, null, document_key, document_label, 'verification', required,
    storage_bucket, storage_path, file_name,
    case when status = 'missing' then 'missing' else 'approved' end,
    submitted_at, now_value, reviewer_name
  from public.partner_application_verification_documents
  where application_id = app.id
  on conflict (partner_id, document_key) do update set
    storage_bucket = excluded.storage_bucket,
    storage_path = coalesce(excluded.storage_path, public.partner_documents.storage_path),
    file_name = coalesce(excluded.file_name, public.partner_documents.file_name),
    status = excluded.status,
    reviewed_at = excluded.reviewed_at,
    reviewed_by = excluded.reviewed_by;

  update public.partner_application_verification_documents
  set status = case when status = 'missing' then 'missing' else 'approved' end,
      reviewed_at = now_value,
      reviewed_by = reviewer_name
  where application_id = app.id;

  if is_accommodation then
    select * into property_row from public.properties where id = app.property_id;
    if property_row.id is null then
      select * into property_row from public.properties where application_id = app.id limit 1;
    end if;
    if property_row.id is null then
      select * into property_row
      from public.properties
      where partner_id = partner_row.id
        and public.normalized_business_identity(name) = public.normalized_business_identity(app.business_name)
      order by created_at
      limit 1;
    end if;

    suffix := 2;
    candidate_slug := base_slug;
    while exists (
      select 1 from public.properties
      where slug = candidate_slug and id is distinct from property_row.id
    ) loop
      candidate_slug := base_slug || '-' || suffix;
      suffix := suffix + 1;
    end loop;

    select price, currency into first_price, first_currency
    from public.partner_application_prices
    where application_id = app.id and active and price > 0 and unit = 'per night'
    order by sort_order
    limit 1;

    select nullif(path_or_note, '') into hero_path
    from public.partner_application_media
    where application_id = app.id and media_type in ('cover', 'hero') and status <> 'rejected'
    order by sort_order limit 1;
    select nullif(path_or_note, '') into logo_path_value
    from public.partner_application_media
    where application_id = app.id and media_type = 'logo' and status <> 'rejected'
    order by sort_order limit 1;
    select coalesce(array_agg(path_or_note order by sort_order) filter (where nullif(path_or_note, '') is not null), '{}')
    into gallery_value
    from public.partner_application_media
    where application_id = app.id and media_type in ('cover', 'hero', 'gallery') and status <> 'rejected';

    select coalesce(array_agg(trim(value)) filter (where trim(value) <> ''), '{}')
    into amenities_value
    from regexp_split_to_table(coalesce(answers->>'amenities', ''), '\s*(?:,|\n|;)\s*') value;
    policies_value := array_remove(array[
      nullif(answers->>'childPolicy', ''),
      nullif(answers->>'extraBedPolicy', ''),
      nullif(answers->>'cancellationPolicy', '')
    ], null);

    if property_row.id is null then
      insert into public.properties (
        application_id, partner_id, name, slug, island, address, whatsapp, email, website,
        google_maps_link, short_description, full_description, hero_image_path, logo_path,
        amenities, policies, check_in_time, check_out_time, operating_hours,
        membership_plan_id, verification_status, publication_status, room_count,
        starting_price, currency, metadata, approved_at, approved_by_user_id, published_at
      ) values (
        app.id, partner_row.id, app.business_name, candidate_slug, app.island, app.address,
        app.whatsapp, lower(app.email), app.website, app.google_maps_link, app.short_description,
        nullif(app.metadata->>'fullDescription', ''), coalesce(hero_path, ''),
        logo_path_value, amenities_value, policies_value,
        case when coalesce(answers->>'checkInTime', answers->>'checkInOut', '') ~ '([01][0-9]|2[0-3]):[0-5][0-9]'
          then substring(coalesce(answers->>'checkInTime', answers->>'checkInOut') from '([01][0-9]|2[0-3]):[0-5][0-9]')::time end,
        case when coalesce(answers->>'checkOutTime', answers->>'checkInOut', '') ~ '([01][0-9]|2[0-3]):[0-5][0-9]'
          then substring(coalesce(answers->>'checkOutTime', answers->>'checkInOut') from '.*?([01][0-9]|2[0-3]):[0-5][0-9]')::time end,
        coalesce(nullif(answers->>'receptionHours', ''), nullif(answers->>'openingHours', '')),
        membership_uuid, 'verified', case when publish_listing then 'published' else 'draft' end,
        nullif(regexp_replace(coalesce(answers->>'roomCount', ''), '\D', '', 'g'), '')::integer,
        first_price, first_currency,
        jsonb_build_object('categoryAnswers', answers, 'applicationId', app.id, 'membership', app.membership_plan),
        now_value, reviewer_user_id, case when publish_listing then now_value else null end
      ) returning * into property_row;
    else
      update public.properties set
        application_id = coalesce(application_id, app.id),
        partner_id = partner_row.id,
        name = app.business_name,
        island = app.island,
        address = coalesce(nullif(app.address, ''), address),
        whatsapp = app.whatsapp,
        email = lower(app.email),
        website = coalesce(nullif(app.website, ''), website),
        google_maps_link = coalesce(nullif(app.google_maps_link, ''), google_maps_link),
        short_description = coalesce(nullif(app.short_description, ''), short_description),
        full_description = coalesce(nullif(app.metadata->>'fullDescription', ''), full_description),
        hero_image_path = coalesce(hero_path, nullif(hero_image_path, ''), ''),
        logo_path = coalesce(logo_path_value, logo_path),
        amenities = case when cardinality(amenities_value) > 0 then amenities_value else amenities end,
        policies = case when cardinality(policies_value) > 0 then policies_value else policies end,
        membership_plan_id = coalesce(membership_uuid, membership_plan_id),
        verification_status = 'verified',
        publication_status = case when publish_listing then 'published' else publication_status end,
        room_count = coalesce(nullif(regexp_replace(coalesce(answers->>'roomCount', ''), '\D', '', 'g'), '')::integer, room_count),
        starting_price = coalesce(first_price, starting_price),
        currency = coalesce(first_currency, currency),
        metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
          'categoryAnswers', answers, 'applicationId', app.id, 'membership', app.membership_plan
        ),
        approved_at = coalesce(approved_at, now_value),
        approved_by_user_id = coalesce(approved_by_user_id, reviewer_user_id),
        published_at = case when publish_listing then coalesce(published_at, now_value) else published_at end
      where id = property_row.id returning * into property_row;
    end if;

    -- Pricing rows are authoritative room definitions. Category room types fill any unpriced rooms.
    for room_price in
      select * from public.partner_application_prices
      where application_id = app.id and active and unit = 'per night' and trim(item_name) <> ''
      order by sort_order
    loop
      insert into public.rooms (
        property_id, name, source_key, bed_type, capacity, adults, children,
        price_per_night, currency, breakfast_included, description, amenities, metadata, active
      ) values (
        property_row.id, room_price.item_name, 'price:' || room_price.id,
        nullif(answers->>'bedTypes', ''), coalesce(nullif(answers->>'roomCapacity', ''), 'Capacity on request'),
        greatest(coalesce(nullif(regexp_replace(coalesce(answers->>'adults', ''), '\D', '', 'g'), '')::integer, 1), 1),
        greatest(coalesce(nullif(regexp_replace(coalesce(answers->>'children', ''), '\D', '', 'g'), '')::integer, 0), 0),
        case when room_price.price > 0 then room_price.price else null end, room_price.currency,
        lower(coalesce(answers->>'breakfastIncluded', 'false')) in ('true', 'yes', 'included', '1'),
        room_price.description, amenities_value,
        jsonb_build_object('applicationPriceId', room_price.id, 'notes', room_price.notes, 'childPrice', room_price.child_price),
        true
      )
      on conflict (property_id, name) do update set
        source_key = coalesce(public.rooms.source_key, excluded.source_key),
        price_per_night = coalesce(public.rooms.price_per_night, excluded.price_per_night),
        currency = coalesce(public.rooms.currency, excluded.currency),
        description = coalesce(public.rooms.description, excluded.description),
        active = true;
    end loop;

    room_names := regexp_split_to_array(coalesce(answers->>'roomTypes', ''), '\s*(?:,|\n|;)\s*');
    if room_names is not null then
      foreach room_name in array room_names loop
        room_name := trim(room_name);
        if room_name <> '' and not exists (
          select 1 from public.rooms
          where property_id = property_row.id and lower(name) = lower(room_name)
        ) then
          room_index := room_index + 1;
          insert into public.rooms (
            property_id, name, source_key, bed_type, capacity, adults, children,
            price_per_night, currency, breakfast_included, amenities, metadata, active
          ) values (
            property_row.id, room_name, 'answer:' || md5(lower(room_name)),
            nullif(answers->>'bedTypes', ''), coalesce(nullif(answers->>'roomCapacity', ''), 'Capacity on request'),
            greatest(coalesce(nullif(regexp_replace(coalesce(answers->>'adults', ''), '\D', '', 'g'), '')::integer, 1), 1),
            greatest(coalesce(nullif(regexp_replace(coalesce(answers->>'children', ''), '\D', '', 'g'), '')::integer, 0), 0),
            null, first_currency,
            lower(coalesce(answers->>'breakfastIncluded', 'false')) in ('true', 'yes', 'included', '1'),
            amenities_value, jsonb_build_object('applicationId', app.id), true
          )
          on conflict (property_id, source_key) where source_key is not null do nothing;
        end if;
      end loop;
    end if;

    -- Explicit prices and submitted assistance options become approved property services.
    insert into public.partner_service_items (
      partner_id, property_id, application_id, source_key, service_type, title,
      description, price, currency, unit, child_price, notes, active, sort_order,
      public_visible, metadata
    )
    select
      partner_row.id, property_row.id, app.id, 'price:' || p.id, 'optional', p.item_name,
      p.description, case when p.price > 0 then p.price else null end, p.currency, p.unit,
      p.child_price, p.notes, p.active, p.sort_order, true,
      jsonb_build_object('applicationPriceId', p.id)
    from public.partner_application_prices p
    where p.application_id = app.id and p.active and p.unit <> 'per night'
    on conflict (application_id, source_key) where application_id is not null and source_key is not null
    do update set
      title = excluded.title, description = excluded.description,
      price = coalesce(excluded.price, public.partner_service_items.price),
      currency = excluded.currency, unit = excluded.unit, child_price = excluded.child_price,
      notes = excluded.notes, active = excluded.active, public_visible = true;

    insert into public.partner_service_items (
      partner_id, property_id, application_id, source_key, service_type, title,
      description, price, currency, unit, active, sort_order, public_visible, metadata
    )
    select
      partner_row.id, property_row.id, app.id, 'answer:' || answer.key, 'assistance',
      case answer.key
        when 'airportTransfer' then 'Airport transfer assistance'
        when 'excursionAssistance' then 'Excursion assistance'
        when 'bicycleRentalAssistance' then 'Bicycle rental assistance'
        when 'localGuestSupport' then 'Local guest support'
      end,
      answer.value, null, coalesce(first_currency, 'USD'), 'per package', true,
      100 + (row_number() over (order by answer.key))::integer, true,
      jsonb_build_object('categoryAnswerKey', answer.key)
    from jsonb_each_text(answers) answer
    where answer.key in ('airportTransfer', 'excursionAssistance', 'bicycleRentalAssistance', 'localGuestSupport')
      and lower(trim(answer.value)) not in ('', 'false', 'no', '0', 'none', 'not available')
    on conflict (application_id, source_key) where application_id is not null and source_key is not null
    do update set
      title = excluded.title, description = excluded.description,
      active = true, public_visible = true;

    -- Public application media is linked; verification/license media never enters the public set.
    insert into public.media_assets (
      application_id, partner_id, property_id, filename, path, storage_path, category,
      media_type, file_type, alt_text, caption, rights_status, archived, sort_order, visibility
    )
    select
      app.id, partner_row.id, property_row.id,
      coalesce(nullif(m.file_name, ''), regexp_replace(m.path_or_note, '^.*/', '')),
      m.path_or_note, m.path_or_note, initcap(m.media_type), m.media_type, 'image/jpeg',
      app.business_name || ' ' || m.label, m.label, 'permission_confirmed', false, m.sort_order, 'public'
    from public.partner_application_media m
    where m.application_id = app.id
      and m.media_type in ('logo', 'cover', 'hero', 'gallery', 'room')
      and nullif(m.path_or_note, '') is not null
      and m.status <> 'rejected'
    on conflict (path) do update set
      application_id = excluded.application_id, partner_id = excluded.partner_id,
      property_id = excluded.property_id, media_type = excluded.media_type,
      sort_order = excluded.sort_order, visibility = 'public', archived = false
    where (
      public.media_assets.application_id = app.id
      or (
        public.media_assets.application_id is null
        and public.media_assets.partner_id is null
        and public.media_assets.property_id is null
      )
    );

    insert into public.property_media (property_id, media_asset_id, usage, sort_order)
    select property_row.id, id,
      case when media_type in ('cover', 'hero') then 'hero' else 'gallery' end,
      sort_order
    from public.media_assets
    where application_id = app.id and property_id = property_row.id and visibility = 'public'
    on conflict (property_id, media_asset_id, usage) do update set sort_order = excluded.sort_order;

    update public.partner_documents set property_id = property_row.id
    where partner_id = partner_row.id and property_id is null;
  end if;

  insert into public.partner_account_invitations (
    partner_id, application_id, email, status, notes, created_by
  ) values (
    partner_row.id, app.id, lower(app.email), 'preview',
    'Partner invitation pending secure server delivery.', reviewer_name
  )
  on conflict (application_id) where application_id is not null and status <> 'cancelled' do nothing;

  update public.partner_applications set
    status = 'approved',
    partner_id = partner_row.id,
    property_id = property_row.id,
    approved_at = coalesce(approved_at, now_value),
    approved_by_user_id = coalesce(approved_by_user_id, reviewer_user_id),
    reviewed_at = now_value,
    reviewed_by = reviewer_name,
    review_notes = case
      when nullif(trim(coalesce(review_note, '')), '') is null then review_notes
      when review_notes @> array[trim(review_note)] then review_notes
      else array[trim(review_note)] || review_notes end
  where id = app.id;

  result := jsonb_build_object(
    'applicationId', app.id,
    'partnerId', partner_row.id,
    'propertyId', property_row.id,
    'partnerSlug', partner_row.slug,
    'propertySlug', property_row.slug,
    'published', publish_listing and property_row.id is not null
  );
  return result;
end;
$$;

comment on function public.approve_partner_application(uuid, uuid, text, boolean, text)
  is 'Transactional, idempotent production application approval. Service role only.';
revoke all on function public.approve_partner_application(uuid, uuid, text, boolean, text) from public, anon, authenticated;
grant execute on function public.approve_partner_application(uuid, uuid, text, boolean, text) to service_role;

create or replace function public.admin_save_property(
  admin_user_id uuid,
  property_uuid uuid,
  property_payload jsonb,
  room_payload jsonb,
  media_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved public.properties%rowtype;
  room_item jsonb;
  media_item jsonb;
  media_row public.media_assets%rowtype;
  room_names text[] := '{}';
  media_paths text[] := '{}';
begin
  if auth.role() <> 'service_role' or not exists (
    select 1 from public.admin_users
    where auth_user_id = admin_user_id and is_active and role in ('owner', 'admin')
  ) then
    raise exception 'Active administrator authorization is required';
  end if;
  if nullif(trim(property_payload->>'name'), '') is null
    or nullif(trim(property_payload->>'slug'), '') is null then
    raise exception 'Property name and slug are required';
  end if;
  if exists (
    select 1 from public.properties
    where slug = property_payload->>'slug' and id is distinct from property_uuid
  ) then
    raise exception 'Property slug is already in use';
  end if;

  if property_uuid is not null then
    select * into saved from public.properties where id = property_uuid for update;
  end if;
  if saved.id is null then
    insert into public.properties (
      name, slug, island, address, latitude, longitude, whatsapp, email, website,
      short_description, full_description, hero_image_path, amenities, policies,
      check_in_time, check_out_time, membership_plan_id, verification_status,
      publication_status, featured, seo_title, seo_description
    ) values (
      trim(property_payload->>'name'), trim(property_payload->>'slug'),
      coalesce(nullif(property_payload->>'island', ''), 'Thoddoo'),
      nullif(property_payload->>'address', ''),
      nullif(property_payload->>'latitude', '')::numeric,
      nullif(property_payload->>'longitude', '')::numeric,
      nullif(property_payload->>'whatsapp', ''), nullif(lower(property_payload->>'email'), ''),
      nullif(property_payload->>'website', ''),
      coalesce(property_payload->>'short_description', ''),
      nullif(property_payload->>'full_description', ''),
      coalesce(property_payload->>'hero_image_path', ''),
      coalesce(array(select jsonb_array_elements_text(property_payload->'amenities')), '{}'),
      coalesce(array(select jsonb_array_elements_text(property_payload->'policies')), '{}'),
      nullif(property_payload->>'check_in_time', '')::time,
      nullif(property_payload->>'check_out_time', '')::time,
      nullif(property_payload->>'membership_plan_id', '')::uuid,
      coalesce(nullif(property_payload->>'verification_status', ''), 'pending'),
      coalesce(nullif(property_payload->>'publication_status', ''), 'draft'),
      coalesce((property_payload->>'featured')::boolean, false),
      nullif(property_payload->>'seo_title', ''), nullif(property_payload->>'seo_description', '')
    ) returning * into saved;
  else
    update public.properties set
      name = trim(property_payload->>'name'),
      slug = trim(property_payload->>'slug'),
      island = coalesce(nullif(property_payload->>'island', ''), island),
      address = nullif(property_payload->>'address', ''),
      latitude = nullif(property_payload->>'latitude', '')::numeric,
      longitude = nullif(property_payload->>'longitude', '')::numeric,
      whatsapp = nullif(property_payload->>'whatsapp', ''),
      email = nullif(lower(property_payload->>'email'), ''),
      website = nullif(property_payload->>'website', ''),
      short_description = coalesce(property_payload->>'short_description', short_description),
      full_description = nullif(property_payload->>'full_description', ''),
      hero_image_path = coalesce(property_payload->>'hero_image_path', hero_image_path),
      amenities = coalesce(array(select jsonb_array_elements_text(property_payload->'amenities')), amenities),
      policies = coalesce(array(select jsonb_array_elements_text(property_payload->'policies')), policies),
      check_in_time = nullif(property_payload->>'check_in_time', '')::time,
      check_out_time = nullif(property_payload->>'check_out_time', '')::time,
      membership_plan_id = nullif(property_payload->>'membership_plan_id', '')::uuid,
      verification_status = coalesce(nullif(property_payload->>'verification_status', ''), verification_status),
      publication_status = coalesce(nullif(property_payload->>'publication_status', ''), publication_status),
      featured = coalesce((property_payload->>'featured')::boolean, featured),
      seo_title = nullif(property_payload->>'seo_title', ''),
      seo_description = nullif(property_payload->>'seo_description', '')
    where id = saved.id returning * into saved;
  end if;

  for room_item in select value from jsonb_array_elements(coalesce(room_payload, '[]'::jsonb))
  loop
    if nullif(trim(room_item->>'name'), '') is null then raise exception 'Room name is required'; end if;
    if nullif(room_item->>'price_per_night', '')::numeric <= 0 then raise exception 'Room price must be positive or null'; end if;
    room_names := array_append(room_names, trim(room_item->>'name'));
    insert into public.rooms (
      property_id, name, bed_type, capacity, adults, children, price_per_night,
      currency, breakfast_included, description, active
    ) values (
      saved.id, trim(room_item->>'name'), nullif(room_item->>'bed_type', ''),
      coalesce(nullif(room_item->>'capacity', ''), 'Capacity on request'),
      greatest(coalesce((room_item->>'adults')::integer, 1), 1),
      greatest(coalesce((room_item->>'children')::integer, 0), 0),
      nullif(room_item->>'price_per_night', '')::numeric,
      coalesce(nullif(room_item->>'currency', ''), 'USD'),
      coalesce((room_item->>'breakfast_included')::boolean, false),
      nullif(room_item->>'description', ''), true
    )
    on conflict (property_id, name) do update set
      bed_type = excluded.bed_type, capacity = excluded.capacity, adults = excluded.adults,
      children = excluded.children, price_per_night = excluded.price_per_night,
      currency = excluded.currency, breakfast_included = excluded.breakfast_included,
      description = excluded.description, active = true;
  end loop;
  update public.rooms set active = false
  where property_id = saved.id and not (name = any(room_names));

  for media_item in select value from jsonb_array_elements(coalesce(media_payload, '[]'::jsonb))
  loop
    if nullif(trim(media_item->>'path'), '') is null then raise exception 'Media path is required'; end if;
    if exists (
      select 1 from public.media_assets
      where path = trim(media_item->>'path')
        and (
          (property_id is not null and property_id <> saved.id)
          or (partner_id is not null and partner_id is distinct from saved.partner_id)
        )
    ) then
      raise exception 'Media belongs to another property';
    end if;
    media_paths := array_append(media_paths, trim(media_item->>'path'));
    insert into public.media_assets (
      application_id, partner_id, property_id, filename, path, storage_path,
      category, media_type, file_type, alt_text, caption, rights_status,
      archived, sort_order, visibility
    ) values (
      saved.application_id, saved.partner_id, saved.id,
      coalesce(nullif(media_item->>'filename', ''), regexp_replace(trim(media_item->>'path'), '^.*/', '')),
      trim(media_item->>'path'), trim(media_item->>'path'),
      coalesce(nullif(media_item->>'category', ''), 'Gallery'),
      coalesce(nullif(media_item->>'media_type', ''), 'gallery'),
      coalesce(nullif(media_item->>'file_type', ''), 'image/jpeg'),
      nullif(media_item->>'alt_text', ''), nullif(media_item->>'caption', ''),
      'permission_confirmed', false, coalesce((media_item->>'sort_order')::integer, 0), 'public'
    )
    on conflict (path) do update set
      application_id = saved.application_id, partner_id = saved.partner_id,
      property_id = saved.id, storage_path = excluded.storage_path,
      category = excluded.category, media_type = excluded.media_type,
      file_type = excluded.file_type, alt_text = excluded.alt_text,
      caption = excluded.caption, archived = false,
      sort_order = excluded.sort_order, visibility = 'public'
    returning * into media_row;
    insert into public.property_media(property_id, media_asset_id, usage, sort_order)
    values (
      saved.id, media_row.id,
      case when media_row.media_type in ('hero', 'cover') then 'hero' else 'gallery' end,
      media_row.sort_order
    )
    on conflict (property_id, media_asset_id, usage)
    do update set sort_order = excluded.sort_order;
  end loop;
  update public.media_assets set visibility = 'private', archived = true
  where property_id = saved.id and visibility = 'public' and not (path = any(media_paths));

  return jsonb_build_object('propertyId', saved.id, 'slug', saved.slug);
end;
$$;

comment on function public.admin_save_property(uuid, uuid, jsonb, jsonb, jsonb)
  is 'Atomically saves an admin-authorized property, rooms, and public media.';
revoke all on function public.admin_save_property(uuid, uuid, jsonb, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.admin_save_property(uuid, uuid, jsonb, jsonb, jsonb) to service_role;

create or replace function public.partner_replace_rooms_services(
  actor_user_id uuid,
  partner_uuid uuid,
  property_uuid uuid,
  items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  item jsonb;
  stable_key text;
  submitted_keys text[] := '{}';
begin
  if auth.role() <> 'service_role' or not exists (
    select 1 from public.partners p join public.properties pr on pr.partner_id = p.id
    where p.id = partner_uuid and pr.id = property_uuid and p.auth_user_id = actor_user_id
  ) then raise exception 'Partner authorization is required'; end if;
  perform 1 from public.properties where id = property_uuid for update;
  for item in select value from jsonb_array_elements(coalesce(items, '[]'::jsonb))
  loop
    if nullif(trim(item->>'title'), '') is null then raise exception 'Room title is required'; end if;
    if nullif(item->>'price', '')::numeric <= 0 then raise exception 'Room price must be positive or null'; end if;
    stable_key := 'partner-room:' || public.production_slug(trim(item->>'title'));
    if stable_key = 'partner-room:' then raise exception 'Stable room identity is required'; end if;
    submitted_keys := array_append(submitted_keys, stable_key);
    insert into public.rooms (
      property_id, name, source_key, bed_type, capacity, adults, children,
      price_per_night, currency, breakfast_included, description, metadata, active
    ) values (
      property_uuid, trim(item->>'title'), stable_key, nullif(item->>'bed_type', ''),
      coalesce(nullif(item->>'capacity', ''), 'Capacity on request'),
      greatest(coalesce((item->>'adults')::integer, 1), 1),
      greatest(coalesce((item->>'children')::integer, 0), 0),
      nullif(item->>'price', '')::numeric, coalesce(nullif(item->>'currency', ''), 'USD'),
      coalesce((item->>'breakfast_included')::boolean, false),
      nullif(item->>'description', ''), coalesce(item->'metadata', '{}'::jsonb),
      coalesce((item->>'active')::boolean, true)
    )
    on conflict (property_id, source_key) where source_key is not null do update set
      name = excluded.name, bed_type = excluded.bed_type, capacity = excluded.capacity,
      adults = excluded.adults, children = excluded.children,
      price_per_night = excluded.price_per_night, currency = excluded.currency,
      breakfast_included = excluded.breakfast_included, description = excluded.description,
      metadata = excluded.metadata, active = excluded.active;
    insert into public.partner_service_items (
      partner_id, property_id, source_key, service_type, title, description,
      price, currency, unit, child_price, notes, active, sort_order, public_visible, metadata
    ) values (
      partner_uuid, property_uuid, stable_key, 'room', trim(item->>'title'),
      nullif(item->>'description', ''), nullif(item->>'price', '')::numeric,
      coalesce(nullif(item->>'currency', ''), 'USD'),
      coalesce(nullif(item->>'unit', ''), 'per night'),
      nullif(item->>'child_price', '')::numeric, nullif(item->>'notes', ''),
      coalesce((item->>'active')::boolean, true), coalesce((item->>'sort_order')::integer, 0),
      true, coalesce(item->'metadata', '{}'::jsonb)
    )
    on conflict (property_id, source_key) where property_id is not null and source_key is not null
    do update set title = excluded.title, description = excluded.description,
      price = excluded.price, currency = excluded.currency, unit = excluded.unit,
      child_price = excluded.child_price, notes = excluded.notes,
      active = excluded.active, sort_order = excluded.sort_order,
      public_visible = true, metadata = excluded.metadata;
  end loop;
  update public.rooms set active = false
  where property_id = property_uuid and source_key like 'partner-room:%'
    and not (source_key = any(submitted_keys));
  update public.partner_service_items set active = false, public_visible = false
  where property_id = property_uuid and source_key like 'partner-room:%'
    and not (source_key = any(submitted_keys));
  return jsonb_build_object('propertyId', property_uuid, 'itemCount', cardinality(submitted_keys));
end;
$$;

comment on function public.partner_replace_rooms_services(uuid, uuid, uuid, jsonb)
  is 'Service-role-only atomic partner room/service replacement; validates the authenticated owner identity supplied by trusted server code and locks the property.';
revoke all on function public.partner_replace_rooms_services(uuid, uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.partner_replace_rooms_services(uuid, uuid, uuid, jsonb) to service_role;

create or replace function public.partner_replace_gallery(
  actor_user_id uuid,
  partner_uuid uuid,
  property_uuid uuid,
  items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  item jsonb;
  asset public.media_assets%rowtype;
  submitted_paths text[] := '{}';
  hero_path text;
begin
  if auth.role() <> 'service_role' or not exists (
    select 1 from public.partners p join public.properties pr on pr.partner_id = p.id
    where p.id = partner_uuid and pr.id = property_uuid and p.auth_user_id = actor_user_id
  ) then raise exception 'Partner authorization is required'; end if;
  perform 1 from public.properties where id = property_uuid for update;
  for item in select value from jsonb_array_elements(coalesce(items, '[]'::jsonb))
  loop
    if nullif(trim(item->>'path'), '') is null then raise exception 'Media path is required'; end if;
    if exists (
      select 1 from public.media_assets
      where path = trim(item->>'path')
        and (
          (property_id is not null and property_id <> property_uuid)
          or (partner_id is not null and partner_id <> partner_uuid)
        )
    ) then raise exception 'Media belongs to another property'; end if;
    submitted_paths := array_append(submitted_paths, trim(item->>'path'));
    insert into public.media_assets (
      partner_id, property_id, filename, path, storage_path, category, media_type,
      file_type, alt_text, caption, rights_status, archived, sort_order, visibility
    ) values (
      partner_uuid, property_uuid,
      coalesce(nullif(item->>'filename', ''), regexp_replace(trim(item->>'path'), '^.*/', '')),
      trim(item->>'path'), trim(item->>'path'),
      case when item->>'usage' in ('hero', 'cover') then 'Hero' else 'Gallery' end,
      coalesce(nullif(item->>'usage', ''), 'gallery'),
      case when item->>'usage' = 'video' then 'video/mp4' else 'image/jpeg' end,
      nullif(item->>'alt_text', ''), nullif(item->>'caption', ''),
      'partner_submitted', false, coalesce((item->>'sort_order')::integer, 0), 'public'
    )
    on conflict (path) do update set
      partner_id = partner_uuid, property_id = property_uuid,
      storage_path = excluded.storage_path, category = excluded.category,
      media_type = excluded.media_type, file_type = excluded.file_type,
      alt_text = excluded.alt_text, caption = excluded.caption,
      archived = false, sort_order = excluded.sort_order, visibility = 'public'
    returning * into asset;
    if item->>'usage' in ('hero', 'cover') and hero_path is null then hero_path := asset.path; end if;
    insert into public.property_media(property_id, media_asset_id, usage, sort_order)
    values (
      property_uuid, asset.id,
      case when item->>'usage' in ('hero', 'cover') then 'hero' else 'gallery' end,
      asset.sort_order
    )
    on conflict (property_id, media_asset_id, usage)
    do update set sort_order = excluded.sort_order;
  end loop;
  update public.media_assets set visibility = 'private', archived = true
  where property_id = property_uuid and rights_status = 'partner_submitted'
    and not (path = any(submitted_paths));
  if hero_path is not null then update public.properties set hero_image_path = hero_path where id = property_uuid; end if;
  return jsonb_build_object('propertyId', property_uuid, 'itemCount', cardinality(submitted_paths));
end;
$$;

comment on function public.partner_replace_gallery(uuid, uuid, uuid, jsonb)
  is 'Service-role-only atomic partner gallery replacement; validates ownership, prevents cross-property media attachment, and keeps omitted assets private rather than deleting them.';
revoke all on function public.partner_replace_gallery(uuid, uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.partner_replace_gallery(uuid, uuid, uuid, jsonb) to service_role;

-- Authenticated partners use narrowly scoped server actions/RPCs. Direct table
-- mutations are revoked so RLS cannot be bypassed by changing admin columns.
revoke insert, update, delete on public.partners, public.properties, public.rooms,
  public.partner_service_items, public.partner_documents, public.bookings,
  public.media_assets, public.property_media, public.partner_media
  from authenticated;

-- Safe public projections: base rows include private/admin fields and are not anonymous-readable.
drop policy if exists "public read verified published properties" on public.properties;
drop policy if exists "public read rooms for verified published properties" on public.rooms;
drop policy if exists "public read property media for verified published properties" on public.property_media;
drop policy if exists "public read media linked to verified published properties" on public.media_assets;
revoke select on public.properties, public.rooms, public.property_media, public.media_assets, public.partner_service_items from anon;

create or replace view public.public_properties
with (security_invoker = false)
as
select
  p.id, p.partner_id, p.name, p.slug, p.island, p.address, p.latitude, p.longitude,
  p.whatsapp, p.email, p.website, p.google_maps_link, p.short_description,
  p.full_description, p.hero_image_path, p.logo_path, p.amenities, p.policies,
  p.check_in_time, p.check_out_time, p.operating_hours, p.social_links,
  p.membership_plan_id, p.verification_status, p.publication_status, p.featured,
  p.seo_title, p.seo_description, p.room_count, p.starting_price, p.currency,
  p.created_at, p.updated_at
from public.properties p
where p.publication_status = 'published' and p.verification_status = 'verified';

create or replace view public.public_rooms
with (security_invoker = false)
as
select
  r.id, r.property_id, r.name, r.bed_type, r.capacity, r.adults, r.children,
  r.price_per_night, r.currency, r.breakfast_included, r.description,
  r.amenities, r.image_paths, r.active, r.created_at, r.updated_at
from public.rooms r
join public.properties p on p.id = r.property_id
where r.active and p.publication_status = 'published' and p.verification_status = 'verified';

create or replace view public.public_property_services
with (security_invoker = false)
as
select
  s.id, s.property_id, s.service_type, s.title, s.description, s.price,
  s.currency, s.unit, s.child_price, s.sort_order
from public.partner_service_items s
join public.properties p on p.id = s.property_id
where s.active and s.public_visible
  and p.publication_status = 'published' and p.verification_status = 'verified';

create or replace view public.public_property_media
with (security_invoker = false)
as
select
  m.id, m.property_id, m.room_id, m.media_type, m.path, m.alt_text,
  m.caption, m.sort_order, m.width, m.height
from public.media_assets m
join public.properties p on p.id = m.property_id
where not m.archived and m.visibility = 'public'
  and p.publication_status = 'published' and p.verification_status = 'verified';

comment on view public.public_properties is 'Anonymous-safe projection of verified, published properties.';
comment on view public.public_rooms is 'Anonymous-safe projection of active rooms for eligible properties.';
comment on view public.public_property_services is 'Anonymous-safe approved optional services.';
comment on view public.public_property_media is 'Anonymous-safe public media; private documents are excluded.';
grant select on public.public_properties, public.public_rooms, public.public_property_services, public.public_property_media
  to anon, authenticated;
