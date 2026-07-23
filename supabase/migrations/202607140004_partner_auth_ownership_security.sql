-- EPIC-044 real partner authentication and ownership security.
-- Additive migration. Do not edit previously applied migrations.

alter table public.partners
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete set null;
create index if not exists partners_auth_user_id_idx on public.partners(auth_user_id);
-- This column is added after the initial onboarding migration so approved applications can be linked safely.
alter table public.partner_applications
  add column if not exists partner_id uuid references public.partners(id) on delete set null;
create index if not exists partner_applications_partner_id_idx on public.partner_applications(partner_id);
create table if not exists public.partner_audit_events (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partners(id) on delete set null,
  auth_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists partner_audit_events_partner_id_idx on public.partner_audit_events(partner_id);
create index if not exists partner_audit_events_auth_user_id_idx on public.partner_audit_events(auth_user_id);
create index if not exists partner_audit_events_event_type_idx on public.partner_audit_events(event_type);
create table if not exists public.partner_account_invitations (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  application_id uuid references public.partner_applications(id) on delete set null,
  email text not null,
  status text not null default 'preview',
  invitation_url text,
  notes text,
  created_by text,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  accepted_at timestamptz
);
create index if not exists partner_account_invitations_partner_id_idx on public.partner_account_invitations(partner_id);
create index if not exists partner_account_invitations_email_idx on public.partner_account_invitations(email);
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'partner_audit_events_event_type_check') then
    alter table public.partner_audit_events add constraint partner_audit_events_event_type_check
      check (event_type in (
        'login',
        'logout',
        'password_reset_requested',
        'profile_update',
        'document_update',
        'price_update',
        'property_update',
        'gallery_update',
        'booking_update',
        'notification_update',
        'invitation_preview_created'
      ));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'partner_account_invitations_status_check') then
    alter table public.partner_account_invitations add constraint partner_account_invitations_status_check
      check (status in ('preview', 'sent', 'accepted', 'expired', 'cancelled'));
  end if;
end $$;
alter table public.partner_audit_events enable row level security;
alter table public.partner_account_invitations enable row level security;
drop policy if exists "Service role can manage partner audit events" on public.partner_audit_events;
drop policy if exists "Service role can manage partner account invitations" on public.partner_account_invitations;
create policy "Service role can manage partner audit events"
  on public.partner_audit_events
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role can manage partner account invitations"
  on public.partner_account_invitations
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
drop policy if exists "Partners can read own audit events" on public.partner_audit_events;
create policy "Partners can read own audit events"
  on public.partner_audit_events
  for select using (auth_user_id = auth.uid());
drop policy if exists "Partners can read own invitation previews" on public.partner_account_invitations;
create policy "Partners can read own invitation previews"
  on public.partner_account_invitations
  for select using (
    exists (
      select 1 from public.partners
      where partners.id = partner_account_invitations.partner_id
        and partners.auth_user_id = auth.uid()
    )
  );
-- Partner-owned record policies. Service role policies remain functional through Supabase role bypass.

drop policy if exists "Partners can read own partner record" on public.partners;
create policy "Partners can read own partner record"
  on public.partners
  for select using (auth_user_id = auth.uid());
drop policy if exists "Partners can update own partner contact profile" on public.partners;
create policy "Partners can update own partner contact profile"
  on public.partners
  for update using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());
drop policy if exists "Partners can read own properties" on public.properties;
create policy "Partners can read own properties"
  on public.properties
  for select using (
    exists (
      select 1 from public.partners
      where partners.id = properties.partner_id
        and partners.auth_user_id = auth.uid()
    )
  );
drop policy if exists "Partners can update own properties" on public.properties;
create policy "Partners can update own properties"
  on public.properties
  for update using (
    exists (
      select 1 from public.partners
      where partners.id = properties.partner_id
        and partners.auth_user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.partners
      where partners.id = properties.partner_id
        and partners.auth_user_id = auth.uid()
    )
  );
drop policy if exists "Partners can manage own rooms" on public.rooms;
create policy "Partners can manage own rooms"
  on public.rooms
  for all using (
    exists (
      select 1
      from public.properties
      join public.partners on partners.id = properties.partner_id
      where properties.id = rooms.property_id
        and partners.auth_user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1
      from public.properties
      join public.partners on partners.id = properties.partner_id
      where properties.id = rooms.property_id
        and partners.auth_user_id = auth.uid()
    )
  );
drop policy if exists "Partners can manage own service items" on public.partner_service_items;
create policy "Partners can manage own service items"
  on public.partner_service_items
  for all using (
    exists (
      select 1 from public.partners
      where partners.id = partner_service_items.partner_id
        and partners.auth_user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.partners
      where partners.id = partner_service_items.partner_id
        and partners.auth_user_id = auth.uid()
    )
  );
drop policy if exists "Partners can manage own documents" on public.partner_documents;
create policy "Partners can manage own documents"
  on public.partner_documents
  for all using (
    exists (
      select 1 from public.partners
      where partners.id = partner_documents.partner_id
        and partners.auth_user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.partners
      where partners.id = partner_documents.partner_id
        and partners.auth_user_id = auth.uid()
    )
  );
drop policy if exists "Partners can read own notifications" on public.partner_notifications;
create policy "Partners can read own notifications"
  on public.partner_notifications
  for select using (
    exists (
      select 1 from public.partners
      where partners.id = partner_notifications.partner_id
        and partners.auth_user_id = auth.uid()
    )
  );
drop policy if exists "Partners can update own notifications" on public.partner_notifications;
create policy "Partners can update own notifications"
  on public.partner_notifications
  for update using (
    exists (
      select 1 from public.partners
      where partners.id = partner_notifications.partner_id
        and partners.auth_user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.partners
      where partners.id = partner_notifications.partner_id
        and partners.auth_user_id = auth.uid()
    )
  );
drop policy if exists "Partners can read own bookings" on public.bookings;
create policy "Partners can read own bookings"
  on public.bookings
  for select using (
    exists (
      select 1 from public.partners
      where partners.id = bookings.partner_id
        and partners.auth_user_id = auth.uid()
    )
  );
drop policy if exists "Partners can update own bookings" on public.bookings;
create policy "Partners can update own bookings"
  on public.bookings
  for update using (
    exists (
      select 1 from public.partners
      where partners.id = bookings.partner_id
        and partners.auth_user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.partners
      where partners.id = bookings.partner_id
        and partners.auth_user_id = auth.uid()
    )
  );
drop policy if exists "Partners can manage own partner media links" on public.partner_media;
create policy "Partners can manage own partner media links"
  on public.partner_media
  for all using (
    exists (
      select 1 from public.partners
      where partners.id = partner_media.partner_id
        and partners.auth_user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.partners
      where partners.id = partner_media.partner_id
        and partners.auth_user_id = auth.uid()
    )
  );
drop policy if exists "Partners can manage own property media links" on public.property_media;
create policy "Partners can manage own property media links"
  on public.property_media
  for all using (
    exists (
      select 1
      from public.properties
      join public.partners on partners.id = properties.partner_id
      where properties.id = property_media.property_id
        and partners.auth_user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1
      from public.properties
      join public.partners on partners.id = properties.partner_id
      where properties.id = property_media.property_id
        and partners.auth_user_id = auth.uid()
    )
  );
drop policy if exists "Partners can create own media assets" on public.media_assets;
create policy "Partners can create own media assets"
  on public.media_assets
  for insert with check (auth.role() = 'authenticated' and rights_status = 'partner_submitted');
drop policy if exists "Partners can update own submitted media assets" on public.media_assets;
create policy "Partners can update own submitted media assets"
  on public.media_assets
  for update using (
    rights_status = 'partner_submitted'
    and (
      exists (
        select 1
        from public.partner_media
        join public.partners on partners.id = partner_media.partner_id
        where partner_media.media_asset_id = media_assets.id
          and partners.auth_user_id = auth.uid()
      )
      or exists (
        select 1
        from public.property_media
        join public.properties on properties.id = property_media.property_id
        join public.partners on partners.id = properties.partner_id
        where property_media.media_asset_id = media_assets.id
          and partners.auth_user_id = auth.uid()
      )
    )
  ) with check (rights_status = 'partner_submitted');
drop policy if exists "Partners can read own application prices" on public.partner_application_prices;
create policy "Partners can read own application prices"
  on public.partner_application_prices
  for select using (
    exists (
      select 1
      from public.partner_applications
      join public.partners on partners.id = partner_applications.partner_id
      where partner_applications.id = partner_application_prices.application_id
        and partners.auth_user_id = auth.uid()
    )
  );
drop policy if exists "Partners can read own application services" on public.partner_application_services;
create policy "Partners can read own application services"
  on public.partner_application_services
  for select using (
    exists (
      select 1
      from public.partner_applications
      join public.partners on partners.id = partner_applications.partner_id
      where partner_applications.id = partner_application_services.application_id
        and partners.auth_user_id = auth.uid()
    )
  );
drop policy if exists "Partners can read own application media" on public.partner_application_media;
create policy "Partners can read own application media"
  on public.partner_application_media
  for select using (
    exists (
      select 1
      from public.partner_applications
      join public.partners on partners.id = partner_applications.partner_id
      where partner_applications.id = partner_application_media.application_id
        and partners.auth_user_id = auth.uid()
    )
  );
drop policy if exists "Partners can read own application verification documents" on public.partner_application_verification_documents;
create policy "Partners can read own application verification documents"
  on public.partner_application_verification_documents
  for select using (
    exists (
      select 1
      from public.partner_applications
      join public.partners on partners.id = partner_applications.partner_id
      where partner_applications.id = partner_application_verification_documents.application_id
        and partners.auth_user_id = auth.uid()
    )
  );
-- Private storage policies for partner verification documents.
-- Expected object name: partner-documents/{partner_id}/{document_id}/{filename}
do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public)
    values ('partner-documents', 'partner-documents', false)
    on conflict (id) do update set public = false;
  end if;
end $$;
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'storage' and table_name = 'objects') then
    drop policy if exists "Partners can read own private documents" on storage.objects;
    create policy "Partners can read own private documents"
      on storage.objects
      for select using (
        bucket_id = 'partner-documents'
        and (storage.foldername(name))[1] = 'partner-documents'
        and exists (
          select 1 from public.partners
          where partners.id::text = (storage.foldername(name))[2]
            and partners.auth_user_id = auth.uid()
        )
      );

    drop policy if exists "Partners can upload own private documents" on storage.objects;
    create policy "Partners can upload own private documents"
      on storage.objects
      for insert with check (
        bucket_id = 'partner-documents'
        and (storage.foldername(name))[1] = 'partner-documents'
        and exists (
          select 1 from public.partners
          where partners.id::text = (storage.foldername(name))[2]
            and partners.auth_user_id = auth.uid()
        )
      );

    drop policy if exists "Partners can replace own private documents" on storage.objects;
    create policy "Partners can replace own private documents"
      on storage.objects
      for update using (
        bucket_id = 'partner-documents'
        and (storage.foldername(name))[1] = 'partner-documents'
        and exists (
          select 1 from public.partners
          where partners.id::text = (storage.foldername(name))[2]
            and partners.auth_user_id = auth.uid()
        )
      ) with check (
        bucket_id = 'partner-documents'
        and (storage.foldername(name))[1] = 'partner-documents'
        and exists (
          select 1 from public.partners
          where partners.id::text = (storage.foldername(name))[2]
            and partners.auth_user_id = auth.uid()
        )
      );
  end if;
end $$;
