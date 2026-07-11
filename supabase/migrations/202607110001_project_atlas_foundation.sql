create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  price_label text not null,
  description text,
  features text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  slug text not null unique,
  owner_name text,
  category text not null,
  status text not null default 'new_lead',
  membership_plan_id uuid references public.membership_plans(id) on delete set null,
  verification_status text not null default 'unverified',
  whatsapp text,
  email text,
  website text,
  address text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  lead_source text,
  priority text default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partners(id) on delete set null,
  name text not null,
  slug text not null unique,
  island text not null default 'Thoddoo',
  address text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  whatsapp text,
  email text,
  website text,
  short_description text not null,
  full_description text,
  hero_image_path text not null,
  check_in_time time,
  check_out_time time,
  membership_plan_id uuid references public.membership_plans(id) on delete set null,
  verification_status text not null default 'pending',
  publication_status text not null default 'draft',
  featured boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  name text not null,
  bed_type text,
  capacity text not null,
  adults integer not null default 2,
  children integer not null default 0,
  price_per_night numeric(12, 2) not null default 0,
  breakfast_included boolean not null default false,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  whatsapp text,
  email text,
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references public.guests(id) on delete restrict,
  property_id uuid not null references public.properties(id) on delete restrict,
  room_id uuid references public.rooms(id) on delete set null,
  partner_id uuid references public.partners(id) on delete set null,
  check_in date not null,
  check_out date not null,
  adults integer not null default 2,
  children integer not null default 0,
  booking_total numeric(12, 2) not null default 0,
  commission_percent numeric(5, 2) not null default 10,
  company_revenue numeric(12, 2) not null default 0,
  partner_revenue numeric(12, 2) not null default 0,
  booking_status text not null default 'new',
  payment_status text not null default 'demo_only',
  special_requests text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  path text not null unique,
  category text not null,
  file_type text not null default 'image/jpeg',
  width integer,
  height integer,
  alt_text text,
  caption text,
  rights_status text not null default 'internal_demo_asset',
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  cuisine text[] not null default '{}',
  location text,
  price_range text,
  opening_hours text,
  image_path text not null,
  publication_status text not null default 'draft',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  category text not null,
  duration text,
  price text,
  image_path text not null,
  highlights text[] not null default '{}',
  publication_status text not null default 'draft',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transfers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  transfer_type text not null,
  description text not null,
  duration text,
  price text,
  departure_point text,
  arrival_point text,
  schedule_note text,
  image_path text not null,
  highlights text[] not null default '{}',
  publication_status text not null default 'draft',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_tasks (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partners(id) on delete cascade,
  title text not null,
  task_type text not null,
  owner text,
  due_date date,
  status text not null default 'open',
  priority text not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_notes (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partners(id) on delete cascade,
  author text not null default 'Admin',
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.property_experiences (
  property_id uuid not null references public.properties(id) on delete cascade,
  experience_id uuid not null references public.experiences(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (property_id, experience_id)
);

create table if not exists public.property_transfers (
  property_id uuid not null references public.properties(id) on delete cascade,
  transfer_id uuid not null references public.transfers(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (property_id, transfer_id)
);

create table if not exists public.property_media (
  property_id uuid not null references public.properties(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete cascade,
  usage text not null default 'gallery',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (property_id, media_asset_id, usage)
);

create table if not exists public.partner_media (
  partner_id uuid not null references public.partners(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete cascade,
  usage text not null default 'profile',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (partner_id, media_asset_id, usage)
);

create index if not exists partners_category_idx on public.partners(category);
create index if not exists partners_verification_status_idx on public.partners(verification_status);
create index if not exists properties_partner_id_idx on public.properties(partner_id);
create index if not exists properties_publication_status_idx on public.properties(publication_status);
create index if not exists properties_featured_idx on public.properties(featured);
create index if not exists rooms_property_id_idx on public.rooms(property_id);
create index if not exists bookings_property_id_idx on public.bookings(property_id);
create index if not exists bookings_partner_id_idx on public.bookings(partner_id);
create index if not exists bookings_guest_id_idx on public.bookings(guest_id);
create index if not exists bookings_status_idx on public.bookings(booking_status);
create index if not exists restaurants_publication_status_idx on public.restaurants(publication_status);
create index if not exists experiences_publication_status_idx on public.experiences(publication_status);
create index if not exists transfers_publication_status_idx on public.transfers(publication_status);
create index if not exists crm_tasks_partner_id_idx on public.crm_tasks(partner_id);
create index if not exists crm_notes_partner_id_idx on public.crm_notes(partner_id);

create trigger membership_plans_set_updated_at before update on public.membership_plans for each row execute function public.set_updated_at();
create trigger partners_set_updated_at before update on public.partners for each row execute function public.set_updated_at();
create trigger properties_set_updated_at before update on public.properties for each row execute function public.set_updated_at();
create trigger rooms_set_updated_at before update on public.rooms for each row execute function public.set_updated_at();
create trigger guests_set_updated_at before update on public.guests for each row execute function public.set_updated_at();
create trigger bookings_set_updated_at before update on public.bookings for each row execute function public.set_updated_at();
create trigger media_assets_set_updated_at before update on public.media_assets for each row execute function public.set_updated_at();
create trigger restaurants_set_updated_at before update on public.restaurants for each row execute function public.set_updated_at();
create trigger experiences_set_updated_at before update on public.experiences for each row execute function public.set_updated_at();
create trigger transfers_set_updated_at before update on public.transfers for each row execute function public.set_updated_at();
create trigger crm_tasks_set_updated_at before update on public.crm_tasks for each row execute function public.set_updated_at();
create trigger crm_notes_set_updated_at before update on public.crm_notes for each row execute function public.set_updated_at();

alter table public.membership_plans enable row level security;
alter table public.partners enable row level security;
alter table public.properties enable row level security;
alter table public.rooms enable row level security;
alter table public.guests enable row level security;
alter table public.bookings enable row level security;
alter table public.media_assets enable row level security;
alter table public.restaurants enable row level security;
alter table public.experiences enable row level security;
alter table public.transfers enable row level security;
alter table public.crm_tasks enable row level security;
alter table public.crm_notes enable row level security;
alter table public.property_experiences enable row level security;
alter table public.property_transfers enable row level security;
alter table public.property_media enable row level security;
alter table public.partner_media enable row level security;

create policy "public read active membership plans" on public.membership_plans for select using (active = true);
create policy "public read published properties" on public.properties for select using (publication_status = 'published');
create policy "public read active rooms for published properties" on public.rooms for select using (
  active = true and exists (
    select 1 from public.properties where properties.id = rooms.property_id and properties.publication_status = 'published'
  )
);
create policy "public read published restaurants" on public.restaurants for select using (publication_status = 'published');
create policy "public read published experiences" on public.experiences for select using (publication_status = 'published');
create policy "public read published transfers" on public.transfers for select using (publication_status = 'published');
create policy "public read linked property experiences" on public.property_experiences for select using (
  exists (select 1 from public.properties where properties.id = property_experiences.property_id and properties.publication_status = 'published')
);
create policy "public read linked property transfers" on public.property_transfers for select using (
  exists (select 1 from public.properties where properties.id = property_transfers.property_id and properties.publication_status = 'published')
);
create policy "public read public media links" on public.property_media for select using (
  exists (select 1 from public.properties where properties.id = property_media.property_id and properties.publication_status = 'published')
);
create policy "public read media linked to published properties" on public.media_assets for select using (
  archived = false and exists (
    select 1
    from public.property_media
    join public.properties on properties.id = property_media.property_id
    where property_media.media_asset_id = media_assets.id
      and properties.publication_status = 'published'
  )
);

-- Service role bypasses RLS automatically in Supabase. Admin dashboard writes should use server-side
-- service role functions only after real authentication is added.
-- Future partner ownership policies should restrict partner reads/writes to auth.uid()-owned partner rows.
