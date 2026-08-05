-- Structured partner operations, transfer timetables, and availability.
-- Additive only. This migration intentionally seeds no business data.

alter table public.partners
  add column if not exists editing_suspended boolean not null default false;

-- Expand the existing audit-event allowlist without invalidating historical rows.
alter table public.partner_audit_events drop constraint if exists partner_audit_events_event_type_check;
alter table public.partner_audit_events add constraint partner_audit_events_event_type_check check (event_type in (
  'login','logout','password_reset_requested','profile_update','document_update','price_update','property_update',
  'gallery_update','booking_update','notification_update','invitation_preview_created','transfer_schedule_update',
  'availability_update','availability_provider_update'
));

create table if not exists public.transfer_schedules (
  id uuid primary key default gen_random_uuid(),
  transfer_id uuid not null references public.transfers(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete cascade,
  direction text not null,
  departure_point text not null,
  arrival_point text not null,
  days_of_week smallint[] not null default '{0,1,2,3,4,5,6}',
  departure_time time not null,
  effective_start date,
  effective_end date,
  friday_specific boolean not null default false,
  price numeric(12,2),
  currency text not null default 'USD',
  unit text not null default 'per person one way',
  vessel_capacity integer,
  vessel_details text,
  luggage_policy text,
  pickup_dropoff text,
  cancellation_notice text,
  weather_notice text,
  active boolean not null default true,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transfer_schedule_days_valid check (days_of_week <@ array[0,1,2,3,4,5,6]::smallint[] and cardinality(days_of_week) > 0),
  constraint transfer_schedule_dates_valid check (effective_end is null or effective_start is null or effective_end >= effective_start),
  constraint transfer_schedule_price_valid check (price is null or price > 0),
  constraint transfer_schedule_capacity_valid check (vessel_capacity is null or vessel_capacity > 0),
  constraint transfer_schedule_currency_valid check (currency in ('USD', 'MVR'))
);

create table if not exists public.transfer_schedule_exceptions (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.transfer_schedules(id) on delete cascade,
  exception_date date not null,
  departure_time time,
  cancelled boolean not null default false,
  notice text,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (schedule_id, exception_date)
);

create table if not exists public.availability_integrations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null unique references public.properties(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete cascade,
  provider text not null default 'manual',
  external_property_id text,
  last_synchronized_at timestamptz,
  sync_status text not null default 'manual',
  error_state text,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint availability_provider_valid check (provider in ('manual', 'pms', 'channel_manager', 'booking_connectivity_future')),
  constraint availability_sync_status_valid check (sync_status in ('manual', 'pending', 'synchronized', 'stale', 'error'))
);

create table if not exists public.room_availability (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete cascade,
  availability_date date not null,
  rooms_available integer,
  rate numeric(12,2),
  currency text not null default 'USD',
  restrictions jsonb not null default '{}'::jsonb,
  provider text not null default 'manual',
  external_property_id text,
  external_room_id text,
  last_synchronized_at timestamptz,
  sync_status text not null default 'manual',
  error_state text,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint room_availability_count_valid check (rooms_available is null or rooms_available >= 0),
  constraint room_availability_rate_valid check (rate is null or rate > 0),
  constraint room_availability_provider_valid check (provider in ('manual', 'pms', 'channel_manager', 'booking_connectivity_future')),
  constraint room_availability_sync_valid check (sync_status in ('manual', 'pending', 'synchronized', 'stale', 'error')),
  constraint room_availability_currency_valid check (currency in ('USD', 'MVR')),
  unique nulls not distinct (property_id, room_id, availability_date, provider)
);

create table if not exists public.partner_change_requests (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  listing_type text not null,
  listing_id uuid not null,
  change_type text not null,
  requested_values jsonb not null,
  status text not null default 'pending',
  requested_by uuid not null,
  reviewed_by uuid,
  review_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint partner_change_request_status_valid check (status in ('pending','approved','rejected'))
);

create index if not exists transfer_schedules_transfer_active_idx on public.transfer_schedules(transfer_id, active, departure_time);
create index if not exists transfer_schedules_effective_departure_idx on public.transfer_schedules(transfer_id, active, effective_start, effective_end, departure_time);
create index if not exists transfer_schedules_days_idx on public.transfer_schedules using gin(days_of_week);
create index if not exists transfer_schedule_exceptions_date_idx on public.transfer_schedule_exceptions(exception_date, schedule_id);
create index if not exists room_availability_property_date_idx on public.room_availability(property_id, availability_date);
create index if not exists room_availability_room_date_idx on public.room_availability(room_id, availability_date);
create index if not exists room_availability_provider_sync_idx on public.room_availability(provider, sync_status, last_synchronized_at);
create index if not exists availability_integrations_provider_sync_idx on public.availability_integrations(provider, sync_status, last_synchronized_at);

alter table public.transfer_schedules enable row level security;
alter table public.transfer_schedule_exceptions enable row level security;
alter table public.availability_integrations enable row level security;
alter table public.room_availability enable row level security;
alter table public.partner_change_requests enable row level security;

revoke all on public.transfer_schedules, public.transfer_schedule_exceptions, public.availability_integrations, public.room_availability, public.partner_change_requests from public, anon, authenticated;
grant select, insert, update, delete on public.transfer_schedules, public.transfer_schedule_exceptions, public.availability_integrations, public.room_availability to service_role;
grant select, insert, update, delete on public.partner_change_requests to service_role;
grant select on public.partner_change_requests to authenticated;

create policy "Public reads eligible active transfer schedules" on public.transfer_schedules for select to anon, authenticated
  using (active and exists (select 1 from public.transfers t where t.id=transfer_id and t.publication_status='published' and t.verification_status='verified'));
create policy "Public reads eligible transfer exceptions" on public.transfer_schedule_exceptions for select to anon, authenticated
  using (exists (select 1 from public.transfer_schedules s where s.id=schedule_id));
create policy "Public reads published room availability" on public.room_availability for select to anon, authenticated
  using (exists (select 1 from public.properties p where p.id=property_id and p.publication_status='published' and p.verification_status='verified'));

create policy "Partners read own transfer schedules" on public.transfer_schedules for select to authenticated
  using (partner_id in (select id from public.partners where auth_user_id = auth.uid()));
create policy "Partners manage own transfer schedules" on public.transfer_schedules for all to authenticated
  using (exists (select 1 from public.partners p join public.transfers t on t.partner_id=p.id where p.id=partner_id and t.id=transfer_id and p.auth_user_id=auth.uid() and not p.editing_suspended))
  with check (exists (select 1 from public.partners p join public.transfers t on t.partner_id=p.id where p.id=partner_id and t.id=transfer_id and p.auth_user_id=auth.uid() and not p.editing_suspended));
create policy "Partners read own transfer exceptions" on public.transfer_schedule_exceptions for select to authenticated
  using (exists (select 1 from public.transfer_schedules s join public.partners p on p.id = s.partner_id where s.id = schedule_id and p.auth_user_id = auth.uid()));
create policy "Partners manage own transfer exceptions" on public.transfer_schedule_exceptions for all to authenticated
  using (exists (select 1 from public.transfer_schedules s join public.partners p on p.id = s.partner_id where s.id = schedule_id and p.auth_user_id = auth.uid() and not p.editing_suspended))
  with check (exists (select 1 from public.transfer_schedules s join public.partners p on p.id = s.partner_id where s.id = schedule_id and p.auth_user_id = auth.uid() and not p.editing_suspended));
create policy "Partners manage own availability integration" on public.availability_integrations for all to authenticated
  using (exists (select 1 from public.partners p join public.properties pr on pr.partner_id=p.id where p.id=partner_id and pr.id=property_id and p.auth_user_id=auth.uid() and not p.editing_suspended))
  with check (exists (select 1 from public.partners p join public.properties pr on pr.partner_id=p.id where p.id=partner_id and pr.id=property_id and p.auth_user_id=auth.uid() and not p.editing_suspended));
create policy "Partners manage own room availability" on public.room_availability for all to authenticated
  using (exists (select 1 from public.partners p join public.properties pr on pr.partner_id=p.id where p.id=partner_id and pr.id=property_id and p.auth_user_id=auth.uid() and not p.editing_suspended and (room_id is null or exists(select 1 from public.rooms r where r.id=room_id and r.property_id=pr.id))))
  with check (exists (select 1 from public.partners p join public.properties pr on pr.partner_id=p.id where p.id=partner_id and pr.id=property_id and p.auth_user_id=auth.uid() and not p.editing_suspended and (room_id is null or exists(select 1 from public.rooms r where r.id=room_id and r.property_id=pr.id))));
create policy "Partners read own change requests" on public.partner_change_requests for select to authenticated
  using (partner_id in (select id from public.partners where auth_user_id=auth.uid()));

create or replace view public.public_transfer_schedules with (security_invoker = false) as
  select s.id, s.transfer_id, s.direction, s.departure_point, s.arrival_point, s.days_of_week, s.departure_time,
    s.effective_start, s.effective_end, s.friday_specific, s.price, s.currency, s.unit, s.vessel_capacity,
    s.vessel_details, s.luggage_policy, s.pickup_dropoff, s.cancellation_notice, s.weather_notice, s.active
  from public.transfer_schedules s join public.transfers t on t.id = s.transfer_id
  where s.active and t.publication_status = 'published' and t.verification_status = 'verified';
create or replace view public.public_transfer_schedule_exceptions with (security_invoker = false) as
  select e.id, e.schedule_id, e.exception_date, e.departure_time, e.cancelled, e.notice
  from public.transfer_schedule_exceptions e join public.public_transfer_schedules s on s.id=e.schedule_id;
create or replace view public.public_room_availability with (security_invoker = false) as
  select a.id, a.property_id, a.room_id, a.availability_date, a.rooms_available, a.rate, a.currency,
    a.restrictions, a.provider, a.last_synchronized_at, a.sync_status
  from public.room_availability a join public.properties p on p.id = a.property_id
  where p.publication_status = 'published' and p.verification_status = 'verified';
grant select on public.public_transfer_schedules, public.public_transfer_schedule_exceptions, public.public_room_availability to anon, authenticated;

create or replace function public.partner_save_transfer_schedule(actor_user_id uuid, partner_uuid uuid, transfer_uuid uuid, schedule_uuid uuid, payload jsonb, exceptions jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare saved_id uuid := coalesce(schedule_uuid, gen_random_uuid()); exception_item jsonb;
begin
  if auth.role() <> 'service_role' or not exists (
    select 1 from public.partners p join public.transfers t on t.partner_id = p.id
    where p.id = partner_uuid and t.id = transfer_uuid and p.auth_user_id = actor_user_id and not p.editing_suspended
  ) then raise exception 'Partner authorization is required'; end if;
  if nullif(trim(payload->>'direction'), '') is null or nullif(trim(payload->>'departurePoint'), '') is null or nullif(trim(payload->>'arrivalPoint'), '') is null then
    raise exception 'Direction and route endpoints are required';
  end if;
  insert into public.transfer_schedules (id, transfer_id, partner_id, direction, departure_point, arrival_point, days_of_week, departure_time,
    effective_start, effective_end, friday_specific, price, currency, unit, vessel_capacity, vessel_details, luggage_policy,
    pickup_dropoff, cancellation_notice, weather_notice, active, updated_by)
  values (saved_id, transfer_uuid, partner_uuid, trim(payload->>'direction'), trim(payload->>'departurePoint'), trim(payload->>'arrivalPoint'),
    array(select jsonb_array_elements_text(payload->'daysOfWeek'))::smallint[], (payload->>'departureTime')::time,
    nullif(payload->>'effectiveStart', '')::date, nullif(payload->>'effectiveEnd', '')::date, coalesce((payload->>'fridaySpecific')::boolean, false),
    nullif(payload->>'price', '')::numeric, coalesce(nullif(payload->>'currency', ''), 'USD'), coalesce(nullif(payload->>'unit', ''), 'per person one way'),
    nullif(payload->>'vesselCapacity', '')::integer, nullif(payload->>'vesselDetails', ''), nullif(payload->>'luggagePolicy', ''),
    nullif(payload->>'pickupDropoff', ''), nullif(payload->>'cancellationNotice', ''), nullif(payload->>'weatherNotice', ''),
    coalesce((payload->>'active')::boolean, true), actor_user_id)
  on conflict (id) do update set direction=excluded.direction, departure_point=excluded.departure_point, arrival_point=excluded.arrival_point,
    days_of_week=excluded.days_of_week, departure_time=excluded.departure_time, effective_start=excluded.effective_start, effective_end=excluded.effective_end,
    friday_specific=excluded.friday_specific, price=excluded.price, currency=excluded.currency, unit=excluded.unit,
    vessel_capacity=excluded.vessel_capacity, vessel_details=excluded.vessel_details, luggage_policy=excluded.luggage_policy,
    pickup_dropoff=excluded.pickup_dropoff, cancellation_notice=excluded.cancellation_notice, weather_notice=excluded.weather_notice,
    active=excluded.active, updated_by=actor_user_id, updated_at=now()
  where public.transfer_schedules.transfer_id=transfer_uuid and public.transfer_schedules.partner_id=partner_uuid;
  if not found then raise exception 'Schedule ownership mismatch'; end if;
  delete from public.transfer_schedule_exceptions where schedule_id=saved_id;
  for exception_item in select value from jsonb_array_elements(coalesce(exceptions, '[]'::jsonb)) loop
    insert into public.transfer_schedule_exceptions(schedule_id, exception_date, departure_time, cancelled, notice, updated_by)
    values(saved_id, (exception_item->>'date')::date, nullif(exception_item->>'departureTime','')::time,
      coalesce((exception_item->>'cancelled')::boolean,false), nullif(exception_item->>'notice',''), actor_user_id);
  end loop;
  insert into public.partner_audit_events(partner_id, auth_user_id, event_type, metadata)
    values(partner_uuid, actor_user_id, 'transfer_schedule_update', jsonb_build_object('transferId',transfer_uuid,'scheduleId',saved_id));
  return saved_id;
end $$;
revoke all on function public.partner_save_transfer_schedule(uuid,uuid,uuid,uuid,jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.partner_save_transfer_schedule(uuid,uuid,uuid,uuid,jsonb,jsonb) to service_role;

create or replace function public.partner_save_manual_availability(actor_user_id uuid, partner_uuid uuid, property_uuid uuid, entries jsonb)
returns integer language plpgsql security definer set search_path = '' as $$
declare item jsonb; saved_count integer := 0;
begin
  if auth.role() <> 'service_role' or not exists (
    select 1 from public.partners p join public.properties pr on pr.partner_id=p.id
    where p.id=partner_uuid and pr.id=property_uuid and p.auth_user_id=actor_user_id and not p.editing_suspended
  ) then raise exception 'Partner authorization is required'; end if;
  for item in select value from jsonb_array_elements(coalesce(entries,'[]'::jsonb)) loop
    if (item->>'date')::date < current_date then raise exception 'Past availability cannot be edited'; end if;
    if nullif(item->>'roomId','') is not null and not exists(select 1 from public.rooms where id=(item->>'roomId')::uuid and property_id=property_uuid) then
      raise exception 'Room ownership mismatch';
    end if;
    insert into public.room_availability(property_id,room_id,partner_id,availability_date,rooms_available,rate,currency,restrictions,provider,sync_status,updated_by)
    values(property_uuid,nullif(item->>'roomId','')::uuid,partner_uuid,(item->>'date')::date,nullif(item->>'roomsAvailable','')::integer,
      nullif(item->>'rate','')::numeric,coalesce(nullif(item->>'currency',''),'USD'),coalesce(item->'restrictions','{}'::jsonb),'manual','manual',actor_user_id)
    on conflict (property_id,room_id,availability_date,provider) do update set rooms_available=excluded.rooms_available,rate=excluded.rate,
      currency=excluded.currency,restrictions=excluded.restrictions,updated_by=actor_user_id,updated_at=now();
    saved_count := saved_count + 1;
  end loop;
  insert into public.partner_audit_events(partner_id,auth_user_id,event_type,metadata)
    values(partner_uuid,actor_user_id,'availability_update',jsonb_build_object('propertyId',property_uuid,'entryCount',saved_count));
  return saved_count;
end $$;
revoke all on function public.partner_save_manual_availability(uuid,uuid,uuid,jsonb) from public, anon, authenticated;
grant execute on function public.partner_save_manual_availability(uuid,uuid,uuid,jsonb) to service_role;

create or replace function public.partner_set_availability_provider(actor_user_id uuid, partner_uuid uuid, property_uuid uuid, provider_name text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare saved_id uuid;
begin
  if provider_name not in ('manual','pms','channel_manager','booking_connectivity_future') then raise exception 'Unsupported availability provider'; end if;
  if auth.role() <> 'service_role' or not exists(select 1 from public.partners p join public.properties pr on pr.partner_id=p.id
    where p.id=partner_uuid and pr.id=property_uuid and p.auth_user_id=actor_user_id and not p.editing_suspended) then raise exception 'Partner authorization is required'; end if;
  insert into public.availability_integrations(property_id,partner_id,provider,sync_status,updated_by)
  values(property_uuid,partner_uuid,provider_name,case when provider_name='manual' then 'manual' else 'pending' end,actor_user_id)
  on conflict(property_id) do update set provider=excluded.provider,sync_status=excluded.sync_status,error_state=null,updated_by=actor_user_id,updated_at=now()
  returning id into saved_id;
  insert into public.partner_audit_events(partner_id,auth_user_id,event_type,metadata)
    values(partner_uuid,actor_user_id,'availability_provider_update',jsonb_build_object('propertyId',property_uuid,'provider',provider_name));
  return saved_id;
end $$;
revoke all on function public.partner_set_availability_provider(uuid,uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.partner_set_availability_provider(uuid,uuid,uuid,text) to service_role;
