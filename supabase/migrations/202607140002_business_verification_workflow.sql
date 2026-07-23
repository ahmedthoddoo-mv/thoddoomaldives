-- EPIC verification workflow.
-- Additive schema for private business verification documents.

create table if not exists public.partner_application_verification_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.partner_applications(id) on delete cascade,
  document_key text not null,
  document_label text not null,
  required boolean not null default true,
  storage_bucket text not null default 'partner-verification-documents',
  storage_path text,
  file_name text,
  mime_type text,
  file_size_bytes bigint,
  status text not null default 'submitted',
  admin_note text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text,
  updated_at timestamptz not null default now(),
  unique(application_id, document_key)
);
create index if not exists partner_application_verification_documents_application_id_idx
  on public.partner_application_verification_documents(application_id);
create index if not exists partner_application_verification_documents_status_idx
  on public.partner_application_verification_documents(status);
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'partner_application_verification_documents_status_check') then
    alter table public.partner_application_verification_documents add constraint partner_application_verification_documents_status_check
      check (status in ('missing', 'submitted', 'approved', 'rejected', 'more_required'));
  end if;
end $$;
drop trigger if exists partner_application_verification_documents_set_updated_at
  on public.partner_application_verification_documents;
create trigger partner_application_verification_documents_set_updated_at
  before update on public.partner_application_verification_documents
  for each row execute function public.set_updated_at();
alter table public.partner_application_verification_documents enable row level security;
drop policy if exists "Service role can manage partner application verification documents"
  on public.partner_application_verification_documents;
create policy "Service role can manage partner application verification documents"
  on public.partner_application_verification_documents
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public)
    values ('partner-verification-documents', 'partner-verification-documents', false)
    on conflict (id) do update set public = false;
  end if;
end $$;
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'storage' and table_name = 'objects') then
    drop policy if exists "Service role can manage partner verification documents" on storage.objects;
    create policy "Service role can manage partner verification documents"
      on storage.objects
      for all
      using (bucket_id = 'partner-verification-documents' and auth.role() = 'service_role')
      with check (bucket_id = 'partner-verification-documents' and auth.role() = 'service_role');
  end if;
end $$;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'properties_published_requires_verified_check') then
    alter table public.properties add constraint properties_published_requires_verified_check
      check (publication_status <> 'published' or verification_status = 'verified') not valid;
  end if;
end $$;
drop policy if exists "public read published properties" on public.properties;
create policy "public read verified published properties" on public.properties
  for select using (publication_status = 'published' and verification_status = 'verified');
drop policy if exists "public read active rooms for published properties" on public.rooms;
drop policy if exists "public read rooms for published properties" on public.rooms;
create policy "public read rooms for verified published properties" on public.rooms for select using (
  active = true and
  exists (
    select 1
    from public.properties
    where properties.id = rooms.property_id
      and properties.publication_status = 'published'
      and properties.verification_status = 'verified'
  )
);
drop policy if exists "public read linked property experiences" on public.property_experiences;
drop policy if exists "public read property experiences for published properties" on public.property_experiences;
create policy "public read property experiences for verified published properties" on public.property_experiences for select using (
  exists (
    select 1
    from public.properties
    where properties.id = property_experiences.property_id
      and properties.publication_status = 'published'
      and properties.verification_status = 'verified'
  )
);
drop policy if exists "public read linked property transfers" on public.property_transfers;
drop policy if exists "public read property transfers for published properties" on public.property_transfers;
create policy "public read property transfers for verified published properties" on public.property_transfers for select using (
  exists (
    select 1
    from public.properties
    where properties.id = property_transfers.property_id
      and properties.publication_status = 'published'
      and properties.verification_status = 'verified'
  )
);
drop policy if exists "public read public media links" on public.property_media;
drop policy if exists "public read property media for published properties" on public.property_media;
create policy "public read property media for verified published properties" on public.property_media for select using (
  exists (
    select 1
    from public.properties
    where properties.id = property_media.property_id
      and properties.publication_status = 'published'
      and properties.verification_status = 'verified'
  )
);
drop policy if exists "public read media linked to published properties" on public.media_assets;
create policy "public read media linked to verified published properties" on public.media_assets for select using (
  exists (
    select 1
    from public.property_media
    join public.properties on properties.id = property_media.property_id
    where property_media.media_asset_id = media_assets.id
      and properties.publication_status = 'published'
      and properties.verification_status = 'verified'
  )
);
