-- Correct room prices from approved partner application prices.
-- Safety: only rooms belonging to properties of this application's managed partners
--         (i.e. properties.partner_id links to partners created via an approved
--         partner_application) are ever touched. Manually created rooms and rooms
--         belonging to unrelated properties or partners from other systems are
--         never deactivated.

-- Step 1: Update room prices from the approved application's price list.
-- Matches rooms by (property_id, name) within the scope of the approved application.
update public.rooms r
set
  price_per_night = app_price.price,
  updated_at = now()
from public.partner_application_prices app_price
join public.partner_applications app      on app.id = app_price.application_id
join public.partners                 pa   on pa.id  = app.partner_id
join public.properties               prop on prop.partner_id = pa.id
where
  app.status      = 'approved'
  and app.partner_id is not null
  and app_price.price is not null
  and app_price.active = true
  and r.property_id = prop.id
  -- match by normalised room name so we never touch an unrelated room
  and lower(trim(r.name)) = lower(trim(app_price.item_name));

-- Step 2: Deactivate stale rooms that belong to an approved application's property
-- but no longer appear in the application's active price list.
-- Only rooms that were inserted through the application workflow are candidates;
-- the join to partner_applications ensures rooms of other properties/partners are
-- never touched.
update public.rooms r
set
  active     = false,
  updated_at = now()
from public.properties              prop
join public.partners                pa   on pa.id  = prop.partner_id
join public.partner_applications    app  on app.partner_id = pa.id
where
  app.status      = 'approved'
  and app.partner_id is not null
  and r.property_id = prop.id
  and r.active = true
  -- only deactivate if the room name does NOT appear in this application's active prices
  and not exists (
    select 1
    from public.partner_application_prices app_price
    where
      app_price.application_id = app.id
      and app_price.active     = true
      and lower(trim(app_price.item_name)) = lower(trim(r.name))
  );
