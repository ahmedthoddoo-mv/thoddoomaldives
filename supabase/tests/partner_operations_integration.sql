begin;
create extension if not exists pgtap with schema extensions;
select plan(1);

do $$
declare
  user_a constant uuid := '10000000-0000-0000-0000-000000000001';
  user_b constant uuid := '10000000-0000-0000-0000-000000000002';
  partner_a constant uuid := '20000000-0000-0000-0000-000000000001';
  partner_b constant uuid := '20000000-0000-0000-0000-000000000002';
  transfer_a constant uuid := '30000000-0000-0000-0000-000000000001';
  transfer_b constant uuid := '30000000-0000-0000-0000-000000000002';
  property_a constant uuid := '40000000-0000-0000-0000-000000000001';
  property_b constant uuid := '40000000-0000-0000-0000-000000000002';
  room_a constant uuid := '50000000-0000-0000-0000-000000000001';
  room_b constant uuid := '50000000-0000-0000-0000-000000000002';
  schedule_id uuid;
  blocked boolean;
begin
  insert into auth.users(instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
  values
    ('00000000-0000-0000-0000-000000000000',user_a,'authenticated','authenticated','operations-a@example.test','',now(),'{}','{}',now(),now()),
    ('00000000-0000-0000-0000-000000000000',user_b,'authenticated','authenticated','operations-b@example.test','',now(),'{}','{}',now(),now());
  insert into public.partners(id,business_name,slug,category,auth_user_id,verification_status)
  values (partner_a,'Operator A','operations-operator-a','transfer',user_a,'verified'),
         (partner_b,'Operator B','operations-operator-b','transfer',user_b,'verified');
  insert into public.transfers(id,partner_id,slug,title,transfer_type,description,image_path,publication_status,verification_status)
  values (transfer_a,partner_a,'operations-transfer-a','Transfer A','speedboat-company','A','/a.jpg','published','verified'),
         (transfer_b,partner_b,'operations-transfer-b','Transfer B','speedboat-company','B','/b.jpg','published','verified');
  insert into public.properties(id,partner_id,name,slug,short_description,hero_image_path,publication_status,verification_status)
  values (property_a,partner_a,'Property A','operations-property-a','A','/a.jpg','published','verified'),
         (property_b,partner_b,'Property B','operations-property-b','B','/b.jpg','published','verified');
  insert into public.rooms(id,property_id,name,capacity,price_per_night,currency)
  values (room_a,property_a,'Room A','2 guests',null,'USD'), (room_b,property_b,'Room B','2 guests',null,'USD');

  perform set_config('request.jwt.claim.role','service_role',true);
  schedule_id := public.partner_save_transfer_schedule(user_a,partner_a,transfer_a,null,
    '{"direction":"Thoddoo to Male","departurePoint":"Thoddoo","arrivalPoint":"Male Airport","daysOfWeek":[0,1,2,3,4,5,6],"departureTime":"13:00","fridaySpecific":false,"price":"35","currency":"USD","unit":"per person one way","active":true}'::jsonb,
    '[{"date":"2026-08-14","departureTime":"14:00","cancelled":false,"notice":"Friday replacement"}]'::jsonb);
  if schedule_id is null then raise exception 'own transfer schedule was not saved'; end if;
  if not exists(select 1 from public.partner_audit_events where partner_id=partner_a and event_type='transfer_schedule_update') then raise exception 'schedule audit missing'; end if;

  blocked := false;
  begin
    perform public.partner_save_transfer_schedule(user_a,partner_a,transfer_b,null,
      '{"direction":"Wrong","departurePoint":"A","arrivalPoint":"B","daysOfWeek":[1],"departureTime":"09:00"}'::jsonb,'[]'::jsonb);
  exception when others then blocked := true; end;
  if not blocked then raise exception 'cross-partner transfer edit was allowed'; end if;

  perform public.partner_save_manual_availability(user_a,partner_a,property_a,
    jsonb_build_array(jsonb_build_object('roomId',room_a,'date',current_date + 2,'roomsAvailable',2,'rate',null,'currency','USD','restrictions',jsonb_build_object('minimumStay',2))));
  if not exists(select 1 from public.room_availability where property_id=property_a and room_id=room_a and rate is null and restrictions->>'minimumStay'='2') then raise exception 'nullable manual availability or restrictions failed'; end if;

  blocked := false;
  begin
    perform public.partner_save_manual_availability(user_a,partner_a,property_b,
      jsonb_build_array(jsonb_build_object('roomId',room_b,'date',current_date + 2,'roomsAvailable',1,'rate',50,'currency','USD')));
  exception when others then blocked := true; end;
  if not blocked then raise exception 'cross-partner property edit was allowed'; end if;

  update public.partners set editing_suspended=true where id=partner_a;
  blocked := false;
  begin
    perform public.partner_set_availability_provider(user_a,partner_a,property_a,'manual');
  exception when others then blocked := true; end;
  if not blocked then raise exception 'suspended partner edit was allowed'; end if;
  update public.partners set editing_suspended=false where id=partner_a;

  insert into public.transfer_schedules(transfer_id,partner_id,direction,departure_point,arrival_point,departure_time,active)
  values(transfer_a,partner_a,'Hidden','A','B','23:00',false);
  if exists(select 1 from public.public_transfer_schedules where direction='Hidden') then raise exception 'inactive departure is public'; end if;
  if exists(select 1 from information_schema.columns where table_schema='public' and table_name='public_transfer_schedules' and column_name in ('partner_id','updated_by')) then raise exception 'public schedule leaks internal identifiers'; end if;
  if has_function_privilege('authenticated','public.partner_save_transfer_schedule(uuid,uuid,uuid,uuid,jsonb,jsonb)','EXECUTE') then raise exception 'ordinary partner can spoof trusted schedule RPC actor'; end if;
  if has_table_privilege('authenticated','public.partner_audit_events','INSERT') then raise exception 'ordinary partner can spoof audit events'; end if;
end $$;

select pass('partner operations ownership, schedule, availability, public projection, and audit checks passed');
select * from finish();

rollback;
