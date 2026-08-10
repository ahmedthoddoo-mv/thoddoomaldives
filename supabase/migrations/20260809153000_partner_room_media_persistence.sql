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
      property_id,
      name,
      source_key,
      bed_type,
      capacity,
      adults,
      children,
      price_per_night,
      currency,
      breakfast_included,
      description,
      amenities,
      image_paths,
      metadata,
      active,
      sort_order
    ) values (
      property_uuid,
      trim(item->>'title'),
      stable_key,
      nullif(item->>'bed_type', ''),
      coalesce(nullif(item->>'capacity', ''), 'Capacity on request'),
      greatest(coalesce((item->>'adults')::integer, 1), 1),
      greatest(coalesce((item->>'children')::integer, 0), 0),
      nullif(item->>'price', '')::numeric,
      coalesce(nullif(item->>'currency', ''), 'USD'),
      coalesce((item->>'breakfast_included')::boolean, false),
      nullif(item->>'description', ''),
      coalesce(array(
        select jsonb_array_elements_text(coalesce(item->'amenities', '[]'::jsonb))
      ), '{}'::text[]),
      coalesce(array(
        select jsonb_array_elements_text(coalesce(item->'image_paths', '[]'::jsonb))
      ), '{}'::text[]),
      coalesce(item->'metadata', '{}'::jsonb),
      coalesce((item->>'active')::boolean, true),
      coalesce((item->>'sort_order')::integer, 0)
    )
    on conflict (property_id, source_key) where source_key is not null do update set
      name = excluded.name,
      bed_type = excluded.bed_type,
      capacity = excluded.capacity,
      adults = excluded.adults,
      children = excluded.children,
      price_per_night = excluded.price_per_night,
      currency = excluded.currency,
      breakfast_included = excluded.breakfast_included,
      description = excluded.description,
      amenities = excluded.amenities,
      image_paths = excluded.image_paths,
      metadata = excluded.metadata,
      active = excluded.active,
      sort_order = excluded.sort_order;

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
    do update set
      title = excluded.title,
      description = excluded.description,
      price = excluded.price,
      currency = excluded.currency,
      unit = excluded.unit,
      child_price = excluded.child_price,
      notes = excluded.notes,
      active = excluded.active,
      sort_order = excluded.sort_order,
      public_visible = true,
      metadata = excluded.metadata;
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
  is 'Partner-owned replacement for room services with ownership checks and room/gallery sync.';
