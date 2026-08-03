-- Preserve the already-applied approval function and add a transactional
-- post-approval synchronization for admin-corrected room prices.

alter function public.approve_partner_application_all_types(uuid, uuid, text, boolean, text)
  rename to approve_partner_application_all_types_core;

create or replace function public.approve_partner_application_all_types(
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
  approval_result jsonb;
  approved_property_id uuid;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service_role is required';
  end if;

  approval_result := public.approve_partner_application_all_types_core(
    application_uuid,
    reviewer_user_id,
    reviewer_name,
    publish_listing,
    review_note
  );

  approved_property_id := nullif(approval_result->>'propertyId', '')::uuid;
  if approved_property_id is null then
    return approval_result;
  end if;

  -- The approved structured price is authoritative, including NULL for
  -- "Price on request". Only price, currency, and active state are changed;
  -- descriptions, capacity, amenities, and other room data are preserved.
  update public.rooms room
  set price_per_night = case when price.price > 0 then price.price else null end,
      currency = price.currency,
      active = true
  from public.partner_application_prices price
  where room.property_id = approved_property_id
    and price.application_id = application_uuid
    and price.active
    and price.unit = 'per night'
    and (
      room.source_key = 'price:' || price.id::text
      or lower(trim(room.name)) = lower(trim(price.item_name))
    );

  -- Retain historical room rows but deactivate stale application-managed
  -- definitions. Unrelated/admin-created rooms are not touched.
  update public.rooms room
  set active = false
  where room.property_id = approved_property_id
    and room.source_key like 'price:%'
    and exists (
      select 1 from public.partner_application_prices owned_price
      where owned_price.application_id = application_uuid
        and 'price:' || owned_price.id::text = room.source_key
    )
    and not exists (
      select 1
      from public.partner_application_prices price
      where price.application_id = application_uuid
        and price.active
        and price.unit = 'per night'
        and (
          room.source_key = 'price:' || price.id::text
          or lower(trim(room.name)) = lower(trim(price.item_name))
        )
    );

  return approval_result;
end;
$$;

comment on function public.approve_partner_application_all_types(uuid, uuid, text, boolean, text)
  is 'Transactional all-category approval with authoritative synchronization of admin-reviewed room prices.';

revoke all on function public.approve_partner_application_all_types_core(uuid, uuid, text, boolean, text)
  from public, anon, authenticated;
grant execute on function public.approve_partner_application_all_types_core(uuid, uuid, text, boolean, text)
  to service_role;
revoke all on function public.approve_partner_application_all_types(uuid, uuid, text, boolean, text)
  from public, anon, authenticated;
grant execute on function public.approve_partner_application_all_types(uuid, uuid, text, boolean, text)
  to service_role;
