create table if not exists public.business_onboarding_drafts (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null check (owner_type in ('admin','partner')),
  owner_id uuid not null,
  business_type text not null default 'restaurant' check (business_type in ('restaurant','guesthouse','experience','transfer')),
  listing_id uuid,
  current_step text not null default 'business',
  data jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_onboarding_drafts enable row level security;

create index if not exists business_onboarding_drafts_owner_idx on public.business_onboarding_drafts(owner_type, owner_id);
create index if not exists business_onboarding_drafts_business_type_idx on public.business_onboarding_drafts(business_type);

drop policy if exists business_onboarding_drafts_service_role_all
on public.business_onboarding_drafts;

create policy business_onboarding_drafts_service_role_all
  on public.business_onboarding_drafts
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
