-- EPIC-042 smart partner onboarding.
-- Additive schema for Supabase-backed partner applications.

create table if not exists public.partner_applications (
  id uuid primary key default gen_random_uuid(),
  application_reference text unique,
  business_name text not null,
  business_type text not null,
  contact_person text not null,
  whatsapp text not null,
  email text not null,
  island text not null default 'Thoddoo',
  address text,
  google_maps_link text,
  website text,
  instagram text,
  facebook text,
  short_description text not null,
  registration_number text,
  membership_plan text not null default 'verified',
  status text not null default 'submitted',
  metadata jsonb not null default '{}'::jsonb,
  notes text,
  missing_information text[] not null default '{}'::text[],
  review_notes text[] not null default '{}'::text[],
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.partner_application_prices (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.partner_applications(id) on delete cascade,
  item_name text not null,
  description text,
  price numeric(12, 2),
  currency text not null default 'USD',
  unit text not null,
  child_price numeric(12, 2),
  notes text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.partner_application_media (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.partner_applications(id) on delete cascade,
  media_type text not null,
  label text not null,
  path_or_note text,
  file_name text,
  status text not null default 'metadata_only',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.partner_application_services (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.partner_applications(id) on delete cascade,
  service_type text not null,
  title text not null,
  details text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists partner_applications_status_idx on public.partner_applications(status);
create index if not exists partner_applications_business_type_idx on public.partner_applications(business_type);
create index if not exists partner_applications_email_idx on public.partner_applications(email);
create index if not exists partner_applications_whatsapp_idx on public.partner_applications(whatsapp);
create index if not exists partner_application_prices_application_id_idx on public.partner_application_prices(application_id);
create index if not exists partner_application_media_application_id_idx on public.partner_application_media(application_id);
create index if not exists partner_application_services_application_id_idx on public.partner_application_services(application_id);
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'partner_applications_status_check') then
    alter table public.partner_applications add constraint partner_applications_status_check
      check (status in ('draft', 'submitted', 'under_review', 'changes_requested', 'approved', 'rejected', 'withdrawn'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'partner_application_prices_currency_check') then
    alter table public.partner_application_prices add constraint partner_application_prices_currency_check
      check (currency in ('USD', 'MVR'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'partner_application_prices_unit_check') then
    alter table public.partner_application_prices add constraint partner_application_prices_unit_check
      check (unit in ('per night', 'per person', 'per trip', 'per hour', 'per transfer', 'per package'));
  end if;
end $$;
drop trigger if exists partner_applications_set_updated_at on public.partner_applications;
drop trigger if exists partner_application_prices_set_updated_at on public.partner_application_prices;
drop trigger if exists partner_application_media_set_updated_at on public.partner_application_media;
drop trigger if exists partner_application_services_set_updated_at on public.partner_application_services;
create trigger partner_applications_set_updated_at before update on public.partner_applications for each row execute function public.set_updated_at();
create trigger partner_application_prices_set_updated_at before update on public.partner_application_prices for each row execute function public.set_updated_at();
create trigger partner_application_media_set_updated_at before update on public.partner_application_media for each row execute function public.set_updated_at();
create trigger partner_application_services_set_updated_at before update on public.partner_application_services for each row execute function public.set_updated_at();
alter table public.partner_applications enable row level security;
alter table public.partner_application_prices enable row level security;
alter table public.partner_application_media enable row level security;
alter table public.partner_application_services enable row level security;
drop policy if exists "Service role can manage partner applications" on public.partner_applications;
drop policy if exists "Service role can manage partner application prices" on public.partner_application_prices;
drop policy if exists "Service role can manage partner application media" on public.partner_application_media;
drop policy if exists "Service role can manage partner application services" on public.partner_application_services;
create policy "Service role can manage partner applications" on public.partner_applications
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role can manage partner application prices" on public.partner_application_prices
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role can manage partner application media" on public.partner_application_media
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role can manage partner application services" on public.partner_application_services
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
