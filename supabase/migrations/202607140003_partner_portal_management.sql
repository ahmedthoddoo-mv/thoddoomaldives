-- EPIC-043 partner portal business management foundation.
-- Additive schema for partner-owned profile extras, services, documents, and notifications.

alter table public.properties add column if not exists google_maps_link text;
alter table public.properties add column if not exists operating_hours text;
alter table public.properties add column if not exists languages text[] not null default '{}'::text[];
alter table public.properties add column if not exists social_links jsonb not null default '{}'::jsonb;
create table if not exists public.partner_service_items (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partners(id) on delete cascade,
  property_id uuid references public.properties(id) on delete cascade,
  service_type text not null default 'room',
  title text not null,
  description text,
  price numeric(12, 2),
  currency text not null default 'USD',
  unit text not null default 'per night',
  child_price numeric(12, 2),
  notes text,
  active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.partner_documents (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,
  document_key text not null,
  document_label text not null,
  category text not null default 'verification',
  required boolean not null default true,
  storage_bucket text not null default 'partner-verification-documents',
  storage_path text,
  file_name text,
  status text not null default 'pending',
  expiry_date date,
  admin_note text,
  uploaded_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(partner_id, document_key)
);
create table if not exists public.partner_notifications (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  title text not null,
  body text not null,
  notification_type text not null default 'system',
  status text not null default 'unread',
  action_href text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists partner_service_items_partner_id_idx on public.partner_service_items(partner_id);
create index if not exists partner_service_items_property_id_idx on public.partner_service_items(property_id);
create index if not exists partner_documents_partner_id_idx on public.partner_documents(partner_id);
create index if not exists partner_documents_status_idx on public.partner_documents(status);
create index if not exists partner_notifications_partner_id_idx on public.partner_notifications(partner_id);
create index if not exists partner_notifications_status_idx on public.partner_notifications(status);
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'partner_service_items_currency_check') then
    alter table public.partner_service_items add constraint partner_service_items_currency_check
      check (currency in ('USD', 'MVR'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'partner_service_items_unit_check') then
    alter table public.partner_service_items add constraint partner_service_items_unit_check
      check (unit in ('per night', 'per person', 'per trip', 'per hour', 'per transfer', 'per package'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'partner_documents_status_check') then
    alter table public.partner_documents add constraint partner_documents_status_check
      check (status in ('uploaded', 'pending', 'approved', 'rejected', 'expired', 'missing'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'partner_notifications_status_check') then
    alter table public.partner_notifications add constraint partner_notifications_status_check
      check (status in ('unread', 'read', 'archived'));
  end if;
end $$;
drop trigger if exists partner_service_items_set_updated_at on public.partner_service_items;
drop trigger if exists partner_documents_set_updated_at on public.partner_documents;
create trigger partner_service_items_set_updated_at
  before update on public.partner_service_items
  for each row execute function public.set_updated_at();
create trigger partner_documents_set_updated_at
  before update on public.partner_documents
  for each row execute function public.set_updated_at();
alter table public.partner_service_items enable row level security;
alter table public.partner_documents enable row level security;
alter table public.partner_notifications enable row level security;
drop policy if exists "Service role can manage partner service items" on public.partner_service_items;
drop policy if exists "Service role can manage partner documents" on public.partner_documents;
drop policy if exists "Service role can manage partner notifications" on public.partner_notifications;
create policy "Service role can manage partner service items"
  on public.partner_service_items
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role can manage partner documents"
  on public.partner_documents
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role can manage partner notifications"
  on public.partner_notifications
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
