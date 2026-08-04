\set ON_ERROR_STOP on
begin;
select set_config('request.jwt.claim.role', 'service_role', true);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values ('10000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'integration-admin@example.test', crypt('local-only', gen_salt('bf')), now(), now(), now());
insert into public.admin_users (auth_user_id, email, role, is_active)
values ('10000000-0000-4000-8000-000000000001', 'integration-admin@example.test', 'admin', true);

insert into public.partner_applications
  (id, business_name, business_type, contact_person, whatsapp, email, island, address, short_description, membership_plan, status, metadata)
values
  ('20000000-0000-4000-8000-000000000001', 'Integration Guesthouse', 'guesthouse', 'Owner One', '+9607000001', 'guesthouse@example.test', 'Thoddoo', 'Beach Road', 'Original description', 'verified', 'under_review', '{"categoryAnswers":{"roomCount":"2","roomCapacity":"2 adults","amenities":"Wi-Fi","checkInTime":"14:00","checkOutTime":"11:00"}}'),
  ('20000000-0000-4000-8000-000000000002', 'Integration Transfer', 'transfer-company', 'Owner Two', '+9607000002', 'transfer@example.test', 'Thoddoo', 'Harbour', 'Transfer description', 'verified', 'under_review', '{"categoryAnswers":{"departurePoint":"Airport","arrivalPoint":"Thoddoo","duration":"75 minutes"}}'),
  ('20000000-0000-4000-8000-000000000003', 'Integration Experience', 'excursion-operator', 'Owner Three', '+9607000003', 'experience@example.test', 'Thoddoo', 'Jetty', 'Experience description', 'verified', 'under_review', '{"categoryAnswers":{"activityName":"Integration Snorkel","activityCategory":"snorkeling","duration":"2 hours","includedItems":"Guide"}}'),
  ('20000000-0000-4000-8000-000000000004', 'Integration Restaurant', 'restaurant', 'Owner Four', '+9607000004', 'restaurant@example.test', 'Thoddoo', 'Main Road', 'Restaurant description', 'verified', 'under_review', '{"categoryAnswers":{"cuisine":"Maldivian","openingHours":"08:00-22:00"}}');

insert into public.partner_application_prices (id, application_id, item_name, price, currency, unit, sort_order)
values
  ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Standard Room', 80, 'USD', 'per night', 1),
  ('30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 'Family Room', 120, 'USD', 'per night', 2),
  ('30000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000002', 'Airport Transfer', 45, 'USD', 'per transfer', 1),
  ('30000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000003', 'Snorkel Trip', 30, 'USD', 'per person', 1),
  ('30000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000004', 'Dinner', null, 'MVR', 'per person', 1);

insert into public.partner_application_media
  (id, application_id, media_type, label, path_or_note, file_name, status, sort_order)
values
  ('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'hero', 'Approved hero', '/integration/approved.jpg', 'approved.jpg', 'submitted', 1),
  ('40000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 'gallery', 'Private gallery', '/integration/private.jpg', 'private.jpg', 'submitted', 2),
  ('40000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000001', 'gallery', 'Unconfirmed gallery', '/integration/unconfirmed.jpg', 'unconfirmed.jpg', 'submitted', 3);

select public.admin_save_application_review(
  '20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Integration Admin',
  '{"common":{"businessName":"Corrected Integration Guesthouse","contactPerson":"Owner One","whatsapp":"+9607000001","email":"guesthouse@example.test","island":"Thoddoo","address":"Beach Road","shortDescription":"Corrected description","fullDescription":"Reviewed full description","membership":"verified"},"category":{"roomCount":"2","roomCapacity":"2 adults","amenities":"Wi-Fi","checkInTime":"14:00","checkOutTime":"11:00"},"verificationNotes":"Local verification complete","publicMediaIds":["40000000-0000-4000-8000-000000000001"],"mediaRightsConfirmed":true}',
  '[{"name":"Standard Room","price":"95","currency":"MVR","unit":"per night"},{"name":"Family Room","price":"","currency":"USD","unit":"per night"}]'
);

-- Model an explicit selection without confirmed publication rights. Approval
-- must not expose it even if the legacy guesthouse approval sees the upload.
update public.partner_application_media
set public_selected = true, admin_rights_confirmed = false
where id = '40000000-0000-4000-8000-000000000003';

select public.approve_partner_application_all_types('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Integration Admin', false, 'Draft approval');

do $$
declare property_uuid uuid;
begin
  select property_id into property_uuid from public.partner_applications where id = '20000000-0000-4000-8000-000000000001';
  if (select count(*) from public.partners where application_id = '20000000-0000-4000-8000-000000000001') <> 1 then raise exception 'guesthouse partner count is not one'; end if;
  if (select count(*) from public.properties where application_id = '20000000-0000-4000-8000-000000000001') <> 1 then raise exception 'guesthouse property count is not one'; end if;
  if (select price_per_night from public.rooms where source_key = 'price:30000000-0000-4000-8000-000000000001') <> 95 then raise exception 'corrected room price not persisted'; end if;
  if (select currency from public.rooms where source_key = 'price:30000000-0000-4000-8000-000000000001') <> 'MVR' then raise exception 'corrected currency not persisted'; end if;
  if (select price_per_night from public.rooms where source_key = 'price:30000000-0000-4000-8000-000000000002') is not null then raise exception 'Price on request was not NULL'; end if;
  if exists (select 1 from public.media_assets where path = '/integration/private.jpg' and visibility = 'public') then raise exception 'unselected media became public'; end if;
  if exists (select 1 from public.media_assets where path = '/integration/unconfirmed.jpg' and visibility = 'public') then raise exception 'rights-unconfirmed media became public'; end if;
  if not exists (select 1 from public.media_assets where path = '/integration/approved.jpg' and visibility = 'public' and rights_status = 'permission_confirmed') then raise exception 'selected approved media is not public'; end if;
  if exists (
    select 1 from public.property_media link
    join public.media_assets asset on asset.id = link.media_asset_id
    where asset.application_id = '20000000-0000-4000-8000-000000000001'
      and asset.visibility <> 'public'
  ) then raise exception 'private application media remained linked to public property media'; end if;

  insert into public.rooms (id, property_id, name, source_key, capacity, price_per_night, currency, description, active)
  values
    ('50000000-0000-4000-8000-000000000001', property_uuid, 'Manual Suite', null, '2 adults', 777, 'USD', 'manual', true),
    ('50000000-0000-4000-8000-000000000002', property_uuid, 'Unmanaged Price Room', 'price:50000000-0000-4000-8000-000000000099', '2 adults', 666, 'USD', 'unmanaged', true),
    ('50000000-0000-4000-8000-000000000003', property_uuid, 'Other Application Room', 'price:30000000-0000-4000-8000-000000000003', '2 adults', 555, 'USD', 'owned by transfer application', true);
end $$;

update public.partner_applications set status = 'under_review' where id = '20000000-0000-4000-8000-000000000001';
select public.admin_save_application_review(
  '20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Integration Admin',
  '{"common":{"businessName":"Corrected Integration Guesthouse","contactPerson":"Owner One","whatsapp":"+9607000001","email":"guesthouse@example.test","island":"Thoddoo","address":"Beach Road","shortDescription":"Corrected description","fullDescription":"Reviewed full description","membership":"verified"},"category":{"roomCount":"1","roomCapacity":"2 adults","amenities":"Wi-Fi"},"verificationNotes":"Second review","publicMediaIds":["40000000-0000-4000-8000-000000000001"],"mediaRightsConfirmed":true}',
  '[{"name":"Standard Room","price":"105","currency":"USD","unit":"per night"}]'
);
select public.approve_partner_application_all_types('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Integration Admin', true, 'Publish approval');
select public.approve_partner_application_all_types('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Integration Admin', true, 'Idempotency retry');

do $$
begin
  if (select count(*) from public.partners where application_id = '20000000-0000-4000-8000-000000000001') <> 1 then raise exception 'repeated approval duplicated partner'; end if;
  if (select count(*) from public.properties where application_id = '20000000-0000-4000-8000-000000000001') <> 1 then raise exception 'repeated approval duplicated property'; end if;
  if (select price_per_night from public.rooms where id = '50000000-0000-4000-8000-000000000001') <> 777 then raise exception 'manual room was modified'; end if;
  if not (select active from public.rooms where id = '50000000-0000-4000-8000-000000000002') then raise exception 'unmanaged price room was deactivated'; end if;
  if not (select active from public.rooms where id = '50000000-0000-4000-8000-000000000003')
    or (select price_per_night from public.rooms where id = '50000000-0000-4000-8000-000000000003') <> 555
  then raise exception 'another application room was modified or deactivated'; end if;
  if (select active from public.rooms where source_key = 'price:30000000-0000-4000-8000-000000000002') then raise exception 'stale current-application room remained active'; end if;
  if not exists (select 1 from public.public_properties where name = 'Corrected Integration Guesthouse') then raise exception 'published guesthouse is not public'; end if;
  if not exists (select 1 from public.partner_application_review_versions where application_id = '20000000-0000-4000-8000-000000000001' and original_values->>'business_name' = 'Integration Guesthouse') then raise exception 'original submission audit snapshot missing'; end if;
end $$;

select public.approve_partner_application_all_types('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'Integration Admin', true, 'Transfer publish');
select public.approve_partner_application_all_types('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', 'Integration Admin', true, 'Experience publish');
select public.approve_partner_application_all_types('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', 'Integration Admin', true, 'Restaurant publish');

do $$
begin
  if (select count(*) from public.partners where application_id in ('20000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000004')) <> 3 then raise exception 'non-guesthouse CRM partners missing'; end if;
  if not exists (select 1 from public.partner_applications where id = '20000000-0000-4000-8000-000000000002' and listing_type = 'transfer' and listing_id is not null) then raise exception 'transfer linkage missing'; end if;
  if not exists (select 1 from public.partner_applications where id = '20000000-0000-4000-8000-000000000003' and listing_type = 'experience' and listing_id is not null) then raise exception 'experience linkage missing'; end if;
  if not exists (select 1 from public.partner_applications where id = '20000000-0000-4000-8000-000000000004' and listing_type = 'restaurant' and listing_id is not null) then raise exception 'restaurant linkage missing'; end if;
  if not exists (select 1 from public.public_transfers where title = 'Integration Transfer') then raise exception 'transfer is not public'; end if;
  if not exists (select 1 from public.public_experiences where title = 'Integration Snorkel') then raise exception 'experience is not public'; end if;
  if not exists (select 1 from public.public_restaurants where name = 'Integration Restaurant') then raise exception 'restaurant is not public'; end if;
  if (select count(*) from public.partner_service_items where application_id = '20000000-0000-4000-8000-000000000004') <> 1 then raise exception 'restaurant service was duplicated'; end if;
  if (select price from public.partner_service_items where application_id = '20000000-0000-4000-8000-000000000004') is not null then raise exception 'nullable service price did not remain NULL'; end if;
end $$;

rollback;
\echo 'LOCAL_PRODUCTION_WORKFLOW_INTEGRATION_OK'
