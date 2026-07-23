-- Additive schema updates for admin review actions and approved public partner publishing.

alter table public.partner_applications
  add column if not exists partner_id uuid references public.partners(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by text;
alter table public.partners
  add column if not exists island text,
  add column if not exists google_maps_link text,
  add column if not exists instagram text,
  add column if not exists facebook text,
  add column if not exists short_description text,
  add column if not exists registration_number text,
  add column if not exists metadata jsonb default '{}'::jsonb;
create index if not exists partner_applications_partner_id_idx on public.partner_applications(partner_id);
create index if not exists partner_applications_reviewed_at_idx on public.partner_applications(reviewed_at);
