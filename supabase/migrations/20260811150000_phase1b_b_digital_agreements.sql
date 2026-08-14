-- Phase 1B-B: Digital Partnership Agreement System
-- Extends Phase 1A agreement infrastructure with draft management, publish safety, and reacceptance support

-- 1. agreement_content: Immutable, structured agreement content
--    Stores sections and full text separately for flexibility in UI rendering
create table if not exists public.agreement_content (
  id uuid primary key default gen_random_uuid(),
  agreement_version_id uuid not null references public.agreement_versions(id) on delete restrict,
  content_type text not null default 'markdown' check (content_type in ('markdown','html','json_sections')),
  -- canonical text content (full agreement)
  full_text text not null,
  -- structured sections for structured rendering (JSON)
  -- expected shape: { "parties": "...", "purpose": "...", "eligibility": "...", ... }
  sections jsonb not null default '{}'::jsonb,
  -- summary for preview
  summary text not null default '',
  -- content hash for immutability verification (SHA-256 of full_text)
  content_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agreement_version_id)
);

-- 2. Extend agreement_versions with publish metadata
alter table public.agreement_versions
  add column if not exists published_by_auth_user_id uuid references auth.users(id) on delete set null,
  add column if not exists summary text,
  add column if not exists superseded_by_version_id uuid references public.agreement_versions(id) on delete set null;

-- 3. agreement_requirement_assignments: Explicit assignments to groups of partners
--    Supports future bulk assignment strategies (all active, selected, by tier, etc.)
create table if not exists public.agreement_requirement_assignments (
  id uuid primary key default gen_random_uuid(),
  agreement_version_id uuid not null references public.agreement_versions(id) on delete restrict,
  partner_id uuid references public.partners(id) on delete cascade,
  -- assignment strategy: 'specific_partner', 'all_active', 'by_tier', 'new_partners_forward'
  -- for Phase 1B-B, only 'specific_partner' is used; others are foundation for future
  assignment_strategy text not null default 'specific_partner' check (assignment_strategy in ('specific_partner','all_active','by_tier','new_partners_forward')),
  assigned_by_auth_user_id uuid not null references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  acceptance_deadline_at timestamptz,
  grace_end_at timestamptz,
  waived_reason text,
  -- operational states: not_required, pending, accepted, reacceptance_required, grace_period, overdue, waived
  state text not null default 'pending' check (state in ('not_required','pending','accepted','reacceptance_required','grace_period','overdue','waived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure at least one of partner_id or assignment_strategy='all_active' etc
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'require_partner_or_bulk'
      and conrelid = 'public.agreement_requirement_assignments'::regclass
  ) then
    alter table public.agreement_requirement_assignments
      add constraint require_partner_or_bulk
      check (
        partner_id is not null
        or assignment_strategy in ('all_active','by_tier','new_partners_forward')
      );
  end if;
end $$;

-- 4. agreement_acceptance_evidence: Detailed evidence preservation
--    Captures everything needed for legal and audit purposes
create table if not exists public.agreement_acceptance_evidence (
  id uuid primary key default gen_random_uuid(),
  acceptance_id uuid not null references public.agreement_acceptances(id) on delete restrict,
  -- exact content hash accepted
  content_hash_accepted text not null,
  -- metadata
  accepted_by_auth_user_id uuid not null references auth.users(id) on delete set null,
  accepting_role text not null, -- the partner_role_code used to accept (partner_owner, partner_staff, etc.)
  accepted_at timestamptz not null default now(),
  -- network/client info
  ip_address text,
  user_agent text,
  -- acceptance statements/evidence
  acceptance_statements jsonb not null default '{}'::jsonb, -- { "read_confirmation": true, "agreement_acceptance": true, "authorized_person": "Name if applicable" }
  -- reference ID for later lookups
  correlation_id text unique,
  created_at timestamptz not null default now()
);

-- 5. Update partner_agreements to support clearer state management
alter table public.partner_agreements
  add column if not exists last_requirement_assignment_id uuid references public.agreement_requirement_assignments(id) on delete set null,
  add column if not exists grace_period_active boolean not null default false,
  add column if not exists reacceptance_triggered_at timestamptz;

-- Indexes for common queries
create index if not exists agreement_content_version_idx on public.agreement_content(agreement_version_id);
create index if not exists agreement_versions_status_idx on public.agreement_versions(status);
create index if not exists agreement_versions_published_at_idx on public.agreement_versions(published_at desc);
create index if not exists agreement_requirement_assignments_agreement_idx on public.agreement_requirement_assignments(agreement_version_id);
create index if not exists agreement_requirement_assignments_partner_idx on public.agreement_requirement_assignments(partner_id) where partner_id is not null;
create index if not exists agreement_requirement_assignments_state_idx on public.agreement_requirement_assignments(state);
create index if not exists agreement_acceptance_evidence_acceptance_idx on public.agreement_acceptance_evidence(acceptance_id);
create index if not exists agreement_acceptance_evidence_content_hash_idx on public.agreement_acceptance_evidence(content_hash_accepted);

-- 6. RLS policies for agreement_content
alter table public.agreement_content enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'agreement_content'
      and policyname = 'agreement_content_service_role'
  ) then
    execute 'create policy agreement_content_service_role on public.agreement_content for all using (current_setting(''role'') = ''service_role'') with check (current_setting(''role'') = ''service_role'')';
  end if;
end $$;

-- Partners can read published versions for agreements they're assigned
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'agreement_content'
      and policyname = 'agreement_content_partner_published_read'
  ) then
    execute 'create policy agreement_content_partner_published_read on public.agreement_content for select using (exists (select 1 from public.partner_agreements pa join public.partners p on p.id = pa.partner_id where pa.current_version_id = agreement_content.agreement_version_id and p.auth_user_id = auth.uid() and exists (select 1 from public.agreement_versions av where av.id = pa.current_version_id and av.status in (''published'',''active''))))';
  end if;
end $$;

-- 7. RLS policies for agreement_acceptance_evidence
alter table public.agreement_acceptance_evidence enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'agreement_acceptance_evidence'
      and policyname = 'evidence_service_role'
  ) then
    execute 'create policy evidence_service_role on public.agreement_acceptance_evidence for all using (current_setting(''role'') = ''service_role'') with check (current_setting(''role'') = ''service_role'')';
  end if;
end $$;

-- Admins can read evidence (via service role in admin handlers)
-- Partners can only read their own acceptance evidence
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'agreement_acceptance_evidence'
      and policyname = 'evidence_partner_own_read'
  ) then
    execute 'create policy evidence_partner_own_read on public.agreement_acceptance_evidence for select using (exists (select 1 from public.agreement_acceptances aa join public.partners p on p.id = aa.partner_id where aa.id = agreement_acceptance_evidence.acceptance_id and p.auth_user_id = auth.uid()))';
  end if;
end $$;

-- 8. Trigger to update partner_agreement's updated_at when evidence is created
create or replace function public.update_partner_agreement_on_evidence()
returns trigger
language plpgsql
as $$
declare
  v_partner_id uuid;
begin
  -- Find the partner from the acceptance record
  select partner_id into v_partner_id
  from public.agreement_acceptances
  where id = new.acceptance_id;
  
  -- Update the partner_agreement's updated_at
  if v_partner_id is not null then
    update public.partner_agreements
    set updated_at = now()
    where partner_id = v_partner_id;
  end if;
  
  return new;
end;
$$;

drop trigger if exists update_partner_agreement_on_evidence on public.agreement_acceptance_evidence;
create trigger update_partner_agreement_on_evidence
  after insert on public.agreement_acceptance_evidence
  for each row
  execute function public.update_partner_agreement_on_evidence();

-- 9. Function to generate content hash (deterministic SHA-256)
--    IMPORTANT: This must be called consistently from application layer
--    The hash is used to verify agreement content has not changed
create or replace function public.compute_agreement_content_hash(content text)
returns text
language plpgsql
as $$
begin
  return encode(digest(content, 'sha256'), 'hex');
end;
$$;

-- 10. Function to validate agreement is immutable after publication
--     Used by application layer to ensure published versions cannot be edited
create or replace function public.can_edit_agreement_version(p_version_id uuid)
returns boolean
language plpgsql
as $$
declare
  v_status text;
begin
  select status into v_status
  from public.agreement_versions
  where id = p_version_id;
  
  -- Can only edit draft versions
  return v_status = 'draft';
end;
$$;

-- 11. Function to create safe reacceptance flow
--     When a new version is published, existing acceptance remains but requires_reacceptance is set
create or replace function public.mark_reacceptance_required(p_old_version_id uuid, p_new_version_id uuid)
returns table(affected_partners bigint)
language plpgsql
as $$
begin
  return query
  update public.partner_agreements
  set
    requires_reacceptance = true,
    requirement_state = 'requires_reacceptance',
    reacceptance_triggered_at = now(),
    updated_at = now()
  where
    accepted_version_id = p_old_version_id
    and requires_reacceptance = false
  returning count(*) over ();
end;
$$;

-- 12. Role-scope enforcement is handled by the trigger in the partner role scope migration.

-- 13. Feature flag configuration table
--     Used to control activation of enforcement and scheduled tasks
create table if not exists public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  flag_key text not null unique,
  enabled boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Insert default feature flags (all OFF during Phase 1B-B)
insert into public.feature_flags (flag_key, enabled, description) values
  ('PARTNER_AGREEMENT_ENFORCEMENT', false, 'Enable agreement enforcement (suspension, unpublishing if not accepted)'),
  ('PARTNER_AGREEMENT_NOTIFICATIONS', false, 'Enable automated agreement reminder emails'),
  ('PARTNER_SUBSCRIPTION_ENFORCEMENT', false, 'Enable subscription enforcement'),
  ('PARTNER_PUBLICATION_ENFORCEMENT', false, 'Enable publication eligibility enforcement')
on conflict (flag_key) do nothing;

-- Trigger to update feature_flags updated_at
create trigger feature_flags_set_updated_at before update on public.feature_flags
  for each row execute function public.set_updated_at();

-- 14. Audit logging for agreement operations
--     Partner audit log already exists; this ensures critical operations are logged
create or replace function public.log_agreement_operation(
  p_partner_id uuid,
  p_event_type text,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
as $$
declare
  v_event_id uuid;
begin
  insert into public.partner_audit_log (
    partner_id,
    event_type,
    occurred_at,
    actor_auth_user_id,
    metadata
  ) values (
    p_partner_id,
    p_event_type,
    now(),
    auth.uid(),
    p_metadata
  )
  returning id into v_event_id;
  
  return v_event_id;
end;
$$;

-- End Phase 1B-B migration
-- Status: READY FOR APPLICATION CODE
-- Enforcement: ALL OFF during Phase 1B-B
-- Testing: Comprehensive test suite required before production migration
