begin;

create table if not exists public.business_media (
  id uuid primary key default gen_random_uuid(),
  business_type text not null check (business_type in ('property', 'restaurant', 'experience', 'transfer')),
  business_id uuid not null,
  media_asset_id uuid not null references public.media_assets(id) on delete cascade,
  partner_id uuid references public.partners(id) on delete set null,
  application_id uuid references public.partner_applications(id) on delete set null,
  caption text,
  alt_text text,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  is_featured boolean not null default false,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_type, business_id, media_asset_id)
);

create index if not exists business_media_business_lookup_idx
  on public.business_media (business_type, business_id, sort_order, created_at);

create unique index if not exists business_media_cover_unique_idx
  on public.business_media (business_type, business_id)
  where is_cover;

create unique index if not exists business_media_featured_unique_idx
  on public.business_media (business_type, business_id)
  where is_featured;

alter table public.business_media enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('business-media', 'business-media', true, 8388608, array['image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create or replace view public.public_business_media as
select
  bm.id,
  bm.business_type,
  bm.business_id,
  bm.media_asset_id,
  bm.caption,
  bm.alt_text,
  bm.sort_order,
  bm.is_cover,
  bm.is_featured,
  ma.path,
  ma.filename,
  ma.file_type,
  ma.width,
  ma.height,
  ma.storage_bucket,
  ma.storage_path
from public.business_media bm
join public.media_assets ma on ma.id = bm.media_asset_id
where bm.is_public
  and not ma.archived
  and case
    when bm.business_type = 'property' then exists (
      select 1
      from public.properties p
      where p.id = bm.business_id
        and p.publication_status = 'published'
        and p.verification_status = 'verified'
    )
    when bm.business_type = 'restaurant' then exists (
      select 1
      from public.restaurants r
      where r.id = bm.business_id
        and r.publication_status = 'published'
        and r.verification_status = 'verified'
    )
    when bm.business_type = 'experience' then exists (
      select 1
      from public.experiences e
      where e.id = bm.business_id
        and e.publication_status = 'published'
        and e.verification_status = 'verified'
    )
    when bm.business_type = 'transfer' then exists (
      select 1
      from public.transfers t
      where t.id = bm.business_id
        and t.publication_status = 'published'
        and t.verification_status = 'verified'
    )
    else false
  end;

grant select on public.public_business_media to anon, authenticated;

commit;
