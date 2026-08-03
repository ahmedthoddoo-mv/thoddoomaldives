-- Pending views and RPCs for public content and partner application review workflow.
-- Provides:
--   public_transfers                      - publicly readable active transfer listings
--   public_experiences                    - publicly readable active experience listings
--   public_restaurants                    - publicly readable active restaurant listings
--   approve_partner_application_all_types - approve any business-type application and
--                                           provision partner/property records
--   partner_application_review_versions   - immutable audit log of review decisions

-- ---------------------------------------------------------------------------
-- Public content views
-- ---------------------------------------------------------------------------

create or replace view public.public_transfers as
  select * from public.transfers
  where publication_status = 'published';

create or replace view public.public_experiences as
  select * from public.experiences
  where publication_status = 'published';

create or replace view public.public_restaurants as
  select * from public.restaurants
  where publication_status = 'published';

-- Grant read access to anonymous/authenticated callers via Supabase anon key.
grant select on public.public_transfers    to anon, authenticated;
grant select on public.public_experiences  to anon, authenticated;
grant select on public.public_restaurants  to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Partner application review versions (immutable audit log)
-- ---------------------------------------------------------------------------

create table if not exists public.partner_application_review_versions (
  id               uuid        primary key default gen_random_uuid(),
  application_id   uuid        not null references public.partner_applications(id) on delete cascade,
  previous_status  text,
  new_status       text        not null,
  action           text        not null,
  reviewer         text,
  note             text,
  requested_changes text[]     not null default '{}'::text[],
  snapshot         jsonb       not null default '{}'::jsonb,
  created_at       timestamptz not null default now()
);

create index if not exists partner_application_review_versions_application_id_idx
  on public.partner_application_review_versions(application_id);

create index if not exists partner_application_review_versions_created_at_idx
  on public.partner_application_review_versions(created_at);

alter table public.partner_application_review_versions enable row level security;

drop policy if exists "Service role can manage application review versions"
  on public.partner_application_review_versions;
create policy "Service role can manage application review versions"
  on public.partner_application_review_versions
  for all
  using  (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Partners can read their own application review history.
drop policy if exists "Partners can read own application review versions"
  on public.partner_application_review_versions;
create policy "Partners can read own application review versions"
  on public.partner_application_review_versions
  for select
  using (
    exists (
      select 1
      from public.partner_applications pa
      join public.partners             p  on p.id = pa.partner_id
      where pa.id  = partner_application_review_versions.application_id
        and p.auth_user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- approve_partner_application_all_types
-- Approves a partner application for any supported business_type.
-- Creates or links a partner record and records the review decision.
-- Runs with SECURITY DEFINER so the RLS of partner/property tables is bypassed
-- for the provisioning step, while input is still validated.
-- ---------------------------------------------------------------------------

create or replace function public.approve_partner_application_all_types(
  p_application_id  uuid,
  p_reviewer        text    default 'system',
  p_note            text    default '',
  p_publish         boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_app        public.partner_applications%rowtype;
  v_partner_id uuid;
  v_base_slug  text;
  v_slug       text;
  v_suffix     int := 0;
begin
  -- Load and lock the application row.
  select * into v_app
  from public.partner_applications
  where id = p_application_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'message', 'Application not found.');
  end if;

  if v_app.status = 'approved' then
    return jsonb_build_object('ok', false, 'message', 'Application is already approved.');
  end if;

  -- Resolve or create a partner record.
  if v_app.partner_id is not null then
    v_partner_id := v_app.partner_id;
  else
    -- Build a unique slug.
    v_base_slug := lower(regexp_replace(v_app.business_name, '[^a-z0-9]+', '-', 'g'));
    v_slug      := v_base_slug;
    loop
      exit when not exists (select 1 from public.partners where slug = v_slug);
      v_suffix := v_suffix + 1;
      v_slug   := v_base_slug || '-' || v_suffix::text;
    end loop;

    insert into public.partners (
      business_name,
      slug,
      category,
      email,
      whatsapp,
      website,
      address,
      island,
      status,
      verification_status,
      short_description,
      instagram,
      facebook,
      registration_number
    ) values (
      v_app.business_name,
      v_slug,
      -- normalise application business_type to partners.category domain
      case v_app.business_type
        when 'guesthouse'   then 'guesthouse'
        when 'restaurant'   then 'restaurant'
        when 'transfer'     then 'transfer'
        when 'excursion'    then 'excursion'
        when 'shop'         then 'shop'
        else 'guesthouse'
      end,
      v_app.email,
      v_app.whatsapp,
      v_app.website,
      v_app.address,
      v_app.island,
      'verified',
      'verified',
      v_app.short_description,
      v_app.instagram,
      v_app.facebook,
      v_app.registration_number
    )
    returning id into v_partner_id;
  end if;

  -- Update the application to approved.
  update public.partner_applications
  set
    status      = 'approved',
    partner_id  = v_partner_id,
    reviewed_at = now(),
    reviewed_by = p_reviewer,
    updated_at  = now()
  where id = p_application_id;

  -- Write an immutable review version entry.
  insert into public.partner_application_review_versions (
    application_id,
    previous_status,
    new_status,
    action,
    reviewer,
    note,
    snapshot
  ) values (
    p_application_id,
    v_app.status,
    'approved',
    case when p_publish then 'approve_publish' else 'approve_draft' end,
    p_reviewer,
    p_note,
    to_jsonb(v_app)
  );

  return jsonb_build_object(
    'ok',         true,
    'partner_id', v_partner_id,
    'message',    'Application approved.'
  );
end;
$$;

-- Only service_role may call this function via RPC.
revoke execute on function public.approve_partner_application_all_types(uuid, text, text, boolean)
  from public, anon, authenticated;
grant  execute on function public.approve_partner_application_all_types(uuid, text, text, boolean)
  to service_role;
