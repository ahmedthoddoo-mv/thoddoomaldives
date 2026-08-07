-- Unify admin-created and partner-submitted businesses under one application workflow.
-- This migration is additive and idempotent.

create or replace function public.application_listing_workflow(p_business_type text)
returns text
language sql
immutable
as $$
  select case
    when p_business_type in ('guesthouse', 'hotel') then 'property'
    when p_business_type in ('restaurant', 'cafe') then 'restaurant'
    when p_business_type in ('speedboat-company', 'ferry-operator', 'transfer-company') then 'transfer'
    else 'experience'
  end;
$$;

create or replace function public.normalize_admin_created_business_type(
  p_listing_type text,
  p_listing_payload jsonb
)
returns text
language sql
immutable
as $$
  select case
    when p_listing_type = 'property' then 'guesthouse'
    when p_listing_type = 'restaurant' then 'restaurant'
    when p_listing_type = 'transfer'
      then case
        when coalesce(nullif(p_listing_payload->>'transferType', ''), '') in ('speedboat-company', 'ferry-operator', 'transfer-company')
          then p_listing_payload->>'transferType'
        else 'transfer-company'
      end
    when p_listing_type = 'experience'
      then case
        when coalesce(nullif(p_listing_payload->>'category', ''), '') in (
          'excursion-operator', 'dive-center', 'watersports', 'photographer', 'farm-experience', 'local-guide'
        )
          then p_listing_payload->>'category'
        else 'excursion-operator'
      end
    else 'other'
  end;
$$;

create or replace function public.is_admin_created_application(p_metadata jsonb)
returns boolean
language sql
immutable
as $$
  select coalesce(p_metadata->>'workflowSource', p_metadata->>'source', 'partner_submitted') = 'admin_created';
$$;

create or replace function public.ensure_admin_listing_application(
  p_listing_uuid uuid,
  p_listing_type text,
  p_business_name text,
  p_business_type text,
  p_island text,
  p_address text,
  p_short_description text,
  p_contact_person text default '',
  p_whatsapp text default '',
  p_email text default '',
  p_existing_application_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  app public.partner_applications%rowtype;
  application_id uuid;
  workflow_metadata jsonb := jsonb_build_object('workflowSource', 'admin_created');
begin
  if p_listing_type not in ('property', 'restaurant', 'experience', 'transfer') then
    raise exception 'Unsupported listing type for application workflow';
  end if;

  if p_existing_application_id is not null then
    select * into app
    from public.partner_applications
    where id = p_existing_application_id
    for update;
  else
    if p_listing_type = 'property' then
      select * into app
      from public.partner_applications
      where property_id = p_listing_uuid
      order by submitted_at desc
      limit 1
      for update;
    else
      select * into app
      from public.partner_applications
      where listing_type = p_listing_type
        and listing_id = p_listing_uuid
      order by submitted_at desc
      limit 1
      for update;
    end if;
  end if;

  if app.id is null then
    insert into public.partner_applications (
      application_reference,
      business_name,
      business_type,
      contact_person,
      whatsapp,
      email,
      island,
      address,
      short_description,
      status,
      metadata,
      property_id,
      listing_id,
      listing_type
    ) values (
      public.next_partner_application_reference(),
      p_business_name,
      p_business_type,
      coalesce(p_contact_person, ''),
      coalesce(p_whatsapp, ''),
      lower(coalesce(p_email, '')),
      coalesce(nullif(p_island, ''), 'Thoddoo'),
      nullif(p_address, ''),
      coalesce(p_short_description, ''),
      'submitted',
      workflow_metadata,
      case when p_listing_type = 'property' then p_listing_uuid else null end,
      p_listing_uuid,
      p_listing_type
    )
    returning id into application_id;
    return application_id;
  end if;

  application_id := app.id;

  if public.is_admin_created_application(app.metadata) then
    update public.partner_applications
    set business_name = p_business_name,
        business_type = p_business_type,
        island = coalesce(nullif(p_island, ''), island),
        address = coalesce(nullif(p_address, ''), address),
        short_description = coalesce(p_short_description, short_description),
        contact_person = case
          when nullif(trim(coalesce(contact_person, '')), '') is null then coalesce(p_contact_person, '')
          else contact_person
        end,
        whatsapp = case
          when nullif(trim(coalesce(whatsapp, '')), '') is null then coalesce(p_whatsapp, '')
          else whatsapp
        end,
        email = case
          when nullif(trim(coalesce(email, '')), '') is null then lower(coalesce(p_email, ''))
          else email
        end,
        metadata = coalesce(metadata, '{}'::jsonb) || workflow_metadata,
        property_id = case when p_listing_type = 'property' then p_listing_uuid else property_id end,
        listing_id = p_listing_uuid,
        listing_type = p_listing_type,
        updated_at = now()
    where id = application_id;
  else
    update public.partner_applications
    set property_id = case when p_listing_type = 'property' then p_listing_uuid else property_id end,
        listing_id = coalesce(listing_id, p_listing_uuid),
        listing_type = coalesce(listing_type, p_listing_type),
        updated_at = now()
    where id = application_id;
  end if;

  return application_id;
end;
$$;

create or replace function public.admin_link_application_listing(
  admin_user_id uuid,
  application_uuid uuid,
  listing_uuid uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  app public.partner_applications%rowtype;
  superseded_app public.partner_applications%rowtype;
  listing_type_value text;
  current_application_id uuid;
  current_partner_id uuid;
  effective_partner_id uuid;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service_role is required';
  end if;
  if not exists (
    select 1 from public.admin_users
    where auth_user_id = admin_user_id
      and is_active
      and role in ('owner', 'admin')
  ) then
    raise exception 'Active administrator authorization is required';
  end if;

  select * into app
  from public.partner_applications
  where id = application_uuid
  for update;
  if not found then
    raise exception 'Application not found';
  end if;

  listing_type_value := public.application_listing_workflow(app.business_type);

  if listing_type_value = 'property' then
    select application_id, partner_id
      into current_application_id, current_partner_id
    from public.properties
    where id = listing_uuid
    for update;
    if current_application_id is null and current_partner_id is null and not exists (select 1 from public.properties where id = listing_uuid) then
      raise exception 'Listing UUID does not identify a property';
    end if;
  elsif listing_type_value = 'restaurant' then
    select application_id, partner_id
      into current_application_id, current_partner_id
    from public.restaurants
    where id = listing_uuid
    for update;
    if current_application_id is null and current_partner_id is null and not exists (select 1 from public.restaurants where id = listing_uuid) then
      raise exception 'Listing UUID does not identify a restaurant';
    end if;
  elsif listing_type_value = 'transfer' then
    select application_id, partner_id
      into current_application_id, current_partner_id
    from public.transfers
    where id = listing_uuid
    for update;
    if current_application_id is null and current_partner_id is null and not exists (select 1 from public.transfers where id = listing_uuid) then
      raise exception 'Listing UUID does not identify a transfer';
    end if;
  else
    select application_id, partner_id
      into current_application_id, current_partner_id
    from public.experiences
    where id = listing_uuid
    for update;
    if current_application_id is null and current_partner_id is null and not exists (select 1 from public.experiences where id = listing_uuid) then
      raise exception 'Listing UUID does not identify an experience';
    end if;
  end if;

  if current_application_id is not null and current_application_id <> app.id then
    select * into superseded_app
    from public.partner_applications
    where id = current_application_id
    for update;

    if superseded_app.id is null then
      raise exception 'Listing is already linked to another application';
    end if;

    if public.is_admin_created_application(superseded_app.metadata)
      and superseded_app.partner_id is null
      and superseded_app.status in ('draft', 'submitted', 'under_review')
    then
      update public.partner_applications
      set listing_id = null,
          listing_type = null,
          property_id = case when listing_type_value = 'property' then null else property_id end,
          status = 'withdrawn',
          review_notes = array_prepend(
            'Superseded by application ' || app.id::text || ' linking to the existing business record.',
            coalesce(review_notes, '{}'::text[])
          ),
          updated_at = now()
      where id = superseded_app.id;
    else
      raise exception 'Listing is already linked to another application';
    end if;
  end if;

  effective_partner_id := coalesce(app.partner_id, current_partner_id);
  if app.partner_id is not null and current_partner_id is not null and app.partner_id <> current_partner_id then
    raise exception 'Listing and application are linked to different partners';
  end if;

  update public.partner_applications
  set listing_id = listing_uuid,
      listing_type = listing_type_value,
      property_id = case when listing_type_value = 'property' then listing_uuid else property_id end,
      partner_id = effective_partner_id,
      updated_at = now()
  where id = app.id;

  if listing_type_value = 'property' then
    update public.properties
    set application_id = app.id,
        partner_id = effective_partner_id
    where id = listing_uuid;
  elsif listing_type_value = 'restaurant' then
    update public.restaurants
    set application_id = app.id,
        partner_id = effective_partner_id
    where id = listing_uuid;
  elsif listing_type_value = 'transfer' then
    update public.transfers
    set application_id = app.id,
        partner_id = effective_partner_id
    where id = listing_uuid;
  else
    update public.experiences
    set application_id = app.id,
        partner_id = effective_partner_id
    where id = listing_uuid;
  end if;

  return jsonb_build_object(
    'applicationId', app.id,
    'listingId', listing_uuid,
    'listingType', listing_type_value,
    'partnerId', effective_partner_id
  );
end;
$$;

create or replace function public.admin_assign_application_partner(
  admin_user_id uuid,
  application_uuid uuid,
  reviewer_name text,
  partner_uuid uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  app public.partner_applications%rowtype;
  partner_row public.partners%rowtype;
  listing_type_value text;
  candidate_slug text;
  base_slug text;
  suffix integer := 2;
  conflict_constraint text;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service_role is required';
  end if;
  if not exists (
    select 1 from public.admin_users
    where auth_user_id = admin_user_id
      and is_active
      and role in ('owner', 'admin')
  ) then
    raise exception 'Active administrator authorization is required';
  end if;

  select * into app
  from public.partner_applications
  where id = application_uuid
  for update;
  if not found then
    raise exception 'Application not found';
  end if;

  listing_type_value := public.application_listing_workflow(app.business_type);

  if partner_uuid is not null then
    select * into partner_row
    from public.partners
    where id = partner_uuid
    for update;
    if partner_row.id is null then
      raise exception 'Partner not found';
    end if;
    if partner_row.application_id is not null and partner_row.application_id <> app.id then
      raise exception 'Selected partner is already linked to another application';
    end if;
  else
    select * into partner_row
    from public.partners
    where id = app.partner_id
    for update;
    if partner_row.id is null then
      select * into partner_row
      from public.partners
      where application_id = app.id
      limit 1
      for update;
    end if;
  end if;

  if partner_row.id is null then
    base_slug := nullif(public.production_slug(app.business_name), '');
    if base_slug is null then
      base_slug := 'partner';
    end if;
    candidate_slug := base_slug;
    while exists (
      select 1 from public.partners
      where slug = candidate_slug and id is distinct from partner_row.id
    ) loop
      candidate_slug := base_slug || '-' || suffix;
      suffix := suffix + 1;
    end loop;

    loop
      begin
        insert into public.partners (
          application_id,
          business_name,
          slug,
          owner_name,
          category,
          status,
          verification_status,
          whatsapp,
          email,
          website,
          address,
          island,
          google_maps_link,
          instagram,
          facebook,
          short_description,
          full_description,
          registration_number,
          lead_source,
          priority,
          metadata
        ) values (
          app.id,
          app.business_name,
          candidate_slug,
          nullif(app.contact_person, ''),
          app.business_type,
          'pending',
          'pending',
          nullif(app.whatsapp, ''),
          nullif(lower(app.email), ''),
          nullif(app.website, ''),
          nullif(app.address, ''),
          app.island,
          nullif(app.google_maps_link, ''),
          nullif(app.instagram, ''),
          nullif(app.facebook, ''),
          app.short_description,
          nullif(app.metadata->>'fullDescription', ''),
          nullif(app.registration_number, ''),
          'Admin created application ' || coalesce(app.application_reference, app.id::text),
          'medium',
          jsonb_build_object('workflowSource', 'admin_created', 'applicationSnapshot', app.metadata)
        )
        returning * into partner_row;
        exit;
      exception when unique_violation then
        get stacked diagnostics conflict_constraint = constraint_name;
        if conflict_constraint <> 'partners_slug_key' then
          raise;
        end if;
        candidate_slug := base_slug || '-' || suffix;
        suffix := suffix + 1;
      end;
    end loop;
  else
    update public.partners
    set application_id = coalesce(application_id, app.id),
        whatsapp = coalesce(nullif(whatsapp, ''), nullif(app.whatsapp, '')),
        email = coalesce(nullif(email, ''), nullif(lower(app.email), '')),
        address = coalesce(nullif(address, ''), nullif(app.address, '')),
        website = coalesce(nullif(website, ''), nullif(app.website, '')),
        short_description = coalesce(nullif(short_description, ''), nullif(app.short_description, ''))
    where id = partner_row.id
    returning * into partner_row;
  end if;

  if listing_type_value = 'property' and app.property_id is not null then
    update public.properties
    set partner_id = partner_row.id,
        application_id = app.id
    where id = app.property_id;
  elsif listing_type_value = 'restaurant' and app.listing_id is not null then
    update public.restaurants
    set partner_id = partner_row.id,
        application_id = app.id
    where id = app.listing_id;
  elsif listing_type_value = 'transfer' and app.listing_id is not null then
    update public.transfers
    set partner_id = partner_row.id,
        application_id = app.id
    where id = app.listing_id;
  elsif listing_type_value = 'experience' and app.listing_id is not null then
    update public.experiences
    set partner_id = partner_row.id,
        application_id = app.id
    where id = app.listing_id;
  end if;

  update public.partner_applications
  set partner_id = partner_row.id,
      status = case when status = 'submitted' then 'under_review' else status end,
      reviewed_at = now(),
      reviewed_by = reviewer_name,
      updated_at = now()
  where id = app.id;

  update public.partner_account_invitations
  set status = 'cancelled',
      notes = concat_ws(' ', notes, 'Superseded by an owner reassignment.')
  where application_id = app.id
    and partner_id <> partner_row.id
    and status <> 'cancelled';

  return jsonb_build_object(
    'applicationId', app.id,
    'partnerId', partner_row.id,
    'listingId', coalesce(app.listing_id, app.property_id),
    'listingType', listing_type_value,
    'status', case when app.status = 'submitted' then 'under_review' else app.status end
  );
end;
$$;

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
      saved_id,
      'transfer',
      trim(listing_payload->>'title'),
      normalized_business_type,
      'Thoddoo',
      coalesce(nullif(listing_payload->>'departurePoint', ''), nullif(listing_payload->>'arrivalPoint', '')),
      coalesce(listing_payload->>'description', ''),
      '',
      '',
      '',
      (select application_id from public.transfers where id = saved_id)
    ) into saved_application_id;

    update public.transfers
    set application_id = saved_application_id
    where id = saved_id;
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
      saved_id,
      'experience',
      trim(listing_payload->>'title'),
      normalized_business_type,
      'Thoddoo',
      nullif(listing_payload->>'location', ''),
      coalesce(listing_payload->>'description', ''),
      '',
      '',
      '',
      (select application_id from public.experiences where id = saved_id)
    ) into saved_application_id;

    update public.experiences
    set application_id = saved_application_id
    where id = saved_id;
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

    select public.ensure_admin_listing_application(
      saved_id,
      'restaurant',
      trim(listing_payload->>'title'),
      normalized_business_type,
      'Thoddoo',
      nullif(listing_payload->>'location', ''),
      coalesce(listing_payload->>'description', ''),
      '',
      '',
      '',
      (select application_id from public.restaurants where id = saved_id)
    ) into saved_application_id;

    update public.restaurants
    set application_id = saved_application_id
    where id = saved_id;
  end if;

  return jsonb_build_object('id', saved_id, 'type', listing_type, 'applicationId', saved_application_id);
end;
$$;

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
  saved_application_id uuid;
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

  select public.ensure_admin_listing_application(
    saved.id,
    'property',
    saved.name,
    'guesthouse',
    saved.island,
    saved.address,
    saved.short_description,
    '',
    coalesce(saved.whatsapp, ''),
    coalesce(saved.email, ''),
    saved.application_id
  ) into saved_application_id;

  update public.properties
  set application_id = saved_application_id
  where id = saved.id
  returning * into saved;

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

  return jsonb_build_object('propertyId', saved.id, 'slug', saved.slug, 'applicationId', saved.application_id);
end;
$$;

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
  existing_application_id uuid;
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
    if app.listing_id is not null then
      select application_id into existing_application_id from public.restaurants where id = app.listing_id;
      if existing_application_id is not null and existing_application_id <> app.id then
        raise exception 'Restaurant is already linked to another application';
      end if;
      update public.restaurants
      set application_id = app.id,
          partner_id = app.partner_id,
          slug = coalesce(nullif(slug, ''), listing_slug),
          name = app.business_name,
          description = app.short_description,
          cuisine = regexp_split_to_array(coalesce(answers->>'cuisine', ''), '\s*(?:,|;|\n)\s*'),
          location = coalesce(app.address, app.island),
          price_range = coalesce(answers->>'averagePrice', price_text),
          opening_hours = answers->>'openingHours',
          image_path = coalesce(nullif(hero_path, ''), image_path),
          publication_status = case when publish_listing then 'published' else publication_status end,
          verification_status = 'verified',
          updated_at = now()
      where id = app.listing_id
      returning id into saved_listing_id;
    else
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
    end if;
  elsif app.business_type in ('speedboat-company', 'ferry-operator', 'transfer-company') then
    if app.listing_id is not null then
      select application_id into existing_application_id from public.transfers where id = app.listing_id;
      if existing_application_id is not null and existing_application_id <> app.id then
        raise exception 'Transfer is already linked to another application';
      end if;
      update public.transfers
      set application_id = app.id,
          partner_id = app.partner_id,
          slug = coalesce(nullif(slug, ''), listing_slug),
          title = app.business_name,
          transfer_type = app.business_type,
          description = app.short_description,
          duration = answers->>'duration',
          price = coalesce(price_text, 'Price on request'),
          departure_point = answers->>'departurePoint',
          arrival_point = answers->>'arrivalPoint',
          schedule_note = answers->>'schedule',
          image_path = coalesce(nullif(hero_path, ''), image_path),
          highlights = array_remove(array[answers->>'routes', answers->>'luggage', answers->>'pickupDropoff'], null),
          publication_status = case when publish_listing then 'published' else publication_status end,
          verification_status = 'verified',
          updated_at = now()
      where id = app.listing_id
      returning id into saved_listing_id;
    else
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
    end if;
  elsif app.business_type in ('excursion-operator', 'dive-center', 'watersports', 'photographer', 'farm-experience', 'local-guide') then
    if app.listing_id is not null then
      select application_id into existing_application_id from public.experiences where id = app.listing_id;
      if existing_application_id is not null and existing_application_id <> app.id then
        raise exception 'Experience is already linked to another application';
      end if;
      update public.experiences
      set application_id = app.id,
          partner_id = app.partner_id,
          slug = coalesce(nullif(slug, ''), listing_slug),
          title = coalesce(nullif(answers->>'activityName', ''), app.business_name),
          description = app.short_description,
          category = coalesce(nullif(answers->>'activityCategory', ''), app.business_type),
          duration = answers->>'duration',
          price = coalesce(price_text, 'Price on request'),
          image_path = coalesce(nullif(hero_path, ''), image_path),
          highlights = regexp_split_to_array(coalesce(answers->>'includedItems', ''), '\s*(?:,|;|\n)\s*'),
          publication_status = case when publish_listing then 'published' else publication_status end,
          verification_status = 'verified',
          updated_at = now()
      where id = app.listing_id
      returning id into saved_listing_id;
    else
      if exists (select 1 from public.experiences where slug = listing_slug and application_id is distinct from app.id) then
        listing_slug := listing_slug || '-' || left(app.id::text, 8);
      end if;
      insert into public.experiences (application_id, partner_id, slug, title, description, category, duration, price, image_path, highlights, publication_status, verification_status)
      values (app.id, app.partner_id, listing_slug, coalesce(nullif(answers->>'activityName', ''), app.business_name), app.short_description,
        coalesce(nullif(answers->>'activityCategory', ''), app.business_type), answers->>'duration', coalesce(price_text, 'Price on request'), coalesce(hero_path, ''),
        regexp_split_to_array(coalesce(answers->>'includedItems', ''), '\s*(?:,|;|\n)\s*'),
        case when publish_listing then 'published' else 'draft' end, 'verified')
      on conflict (application_id) where application_id is not null do update set
        title = excluded.title, description = excluded.description, category = excluded.category, duration = excluded.duration, price = excluded.price,
        image_path = excluded.image_path, highlights = excluded.highlights,
        publication_status = case when publish_listing then 'published' else public.experiences.publication_status end,
        verification_status = 'verified', updated_at = now()
      returning id into saved_listing_id;
    end if;
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

revoke all on function public.ensure_admin_listing_application(uuid, text, text, text, text, text, text, text, text, text, uuid) from public, anon, authenticated;
grant execute on function public.ensure_admin_listing_application(uuid, text, text, text, text, text, text, text, text, text, uuid) to service_role;
revoke all on function public.admin_link_application_listing(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.admin_link_application_listing(uuid, uuid, uuid) to service_role;
revoke all on function public.admin_assign_application_partner(uuid, uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.admin_assign_application_partner(uuid, uuid, text, uuid) to service_role;
