begin;

create extension if not exists pgcrypto;

create table if not exists public.partner_lifecycles (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null unique references public.partners(id) on delete restrict,
  lifecycle_state text not null default 'application' check (lifecycle_state in ('application','verification_pending','verification_rejected','approved','agreement_required','agreement_pending','active','restricted','suspended','archived')),
  editing_allowed boolean not null default true,
  requires_action boolean not null default false,
  grace_period_active boolean not null default false,
  can_login boolean not null default true,
  can_view_dashboard boolean not null default true,
  can_manage_listings boolean not null default true,
  publication_blocked_reason text,
  last_transition_at timestamptz,
  last_transition_reason text,
  financial_standing_state text not null default 'good_standing' check (financial_standing_state in ('good_standing','action_required','grace_period','restricted','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_verifications (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null unique references public.partners(id) on delete restrict,
  verification_state text not null default 'not_started' check (verification_state in ('not_started','pending','in_review','approved','rejected','expired','suspended')),
  reviewed_by_admin_id uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_notes text,
  documents_complete boolean not null default false,
  documents_expired boolean not null default false,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agreement_versions (
  id uuid primary key default gen_random_uuid(),
  version_number integer not null,
  title text not null,
  slug text not null,
  effective_at timestamptz,
  published_at timestamptz,
  status text not null default 'draft' check (status in ('draft','published','active','superseded','retired')),
  material_change boolean not null default false,
  acceptance_deadline_days integer,
  document_url text,
  storage_path text,
  content_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug, version_number)
);

create table if not exists public.partner_agreements (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null unique references public.partners(id) on delete restrict,
  current_version_id uuid references public.agreement_versions(id) on delete set null,
  requirement_state text not null default 'not_required' check (requirement_state in ('not_required','required_pending_acceptance','accepted','requires_reacceptance','expired','superseded')),
  acceptance_deadline_at timestamptz,
  accepted_version_id uuid references public.agreement_versions(id) on delete set null,
  accepted_at timestamptz,
  requires_reacceptance boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agreement_acceptances (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete restrict,
  agreement_version_id uuid not null references public.agreement_versions(id) on delete restrict,
  accepted_by_auth_user_id uuid references auth.users(id) on delete set null,
  accepted_at timestamptz not null default now(),
  ip_address text,
  user_agent text,
  acceptance_evidence jsonb not null default '{}'::jsonb,
  acceptance_method text not null default 'web' check (acceptance_method in ('web','service_role','admin_override','import')),
  material_reacceptance boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.partner_subscriptions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null unique references public.partners(id) on delete restrict,
  plan_id uuid references public.membership_plans(id) on delete set null,
  subscription_state text not null default 'draft' check (subscription_state in ('draft','complimentary_active','paid_active','grace_period','expired','cancelled','suspended','reactivated')),
  billing_model text not null default 'complimentary' check (billing_model in ('complimentary','paid','waived','custom')),
  normal_price_amount numeric(12, 2),
  discount_percentage numeric(5, 2) not null default 0 check (discount_percentage >= 0 and discount_percentage <= 100),
  currency text not null default 'USD' check (currency in ('USD','MVR')),
  complimentary_start_at timestamptz,
  complimentary_end_at timestamptz,
  current_period_start_at timestamptz,
  current_period_end_at timestamptz,
  grace_end_at timestamptz,
  next_billing_at timestamptz,
  auto_renew boolean not null default false,
  waiver_applied boolean not null default false,
  waiver_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (complimentary_start_at is null or complimentary_end_at is null or complimentary_end_at > complimentary_start_at),
  check (current_period_start_at is null or current_period_end_at is null or current_period_end_at > current_period_start_at),
  check (grace_end_at is null or current_period_end_at is null or grace_end_at >= current_period_end_at)
);

create table if not exists public.partner_subscription_events (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.partner_subscriptions(id) on delete restrict,
  actor_auth_user_id uuid references auth.users(id) on delete set null,
  event_type text not null check (event_type in ('created','complimentary_started','complimentary_extended','converted_to_paid','grace_started','grace_ended','plan_changed','waived','cancelled','suspended','reactivated')),
  occurred_at timestamptz not null default now(),
  reason text,
  payload jsonb not null default '{}'::jsonb,
  source text not null default 'system' check (source in ('system','admin','partner','migration','automation')),
  created_at timestamptz not null default now()
);

create table if not exists public.partner_publication_eligibility (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete restrict,
  listing_type text not null check (listing_type in ('property','restaurant','experience','transfer')),
  listing_id uuid not null,
  eligibility_state text not null default 'pending_review' check (eligibility_state in ('eligible','not_eligible','pending_review')),
  reason_code text,
  reason_details text,
  evaluated_at timestamptz,
  evaluated_by_admin_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (partner_id, listing_type, listing_id)
);

create table if not exists public.partner_roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  display_name text not null,
  description text,
  is_system_role boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_user_roles (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete restrict,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.partner_roles(id) on delete restrict,
  assigned_at timestamptz not null default now(),
  assigned_by_admin_id uuid references auth.users(id) on delete set null,
  revoked_at timestamptz,
  expires_at timestamptz,
  reason text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (partner_id, auth_user_id, role_id) deferrable initially deferred
);

create table if not exists public.partner_audit_log (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partners(id) on delete restrict,
  actor_auth_user_id uuid references auth.users(id) on delete set null,
  actor_role text,
  event_type text not null,
  entity_type text,
  entity_id text,
  occurred_at timestamptz not null default now(),
  reason text,
  before_payload jsonb not null default '{}'::jsonb,
  after_payload jsonb not null default '{}'::jsonb,
  correlation_id text,
  source text not null default 'system' check (source in ('system','admin','partner','migration','automation')),
  created_at timestamptz not null default now()
);

create index if not exists partner_lifecycles_state_idx on public.partner_lifecycles(lifecycle_state);
create index if not exists partner_verifications_state_idx on public.partner_verifications(verification_state);
create index if not exists partner_agreements_requirement_state_idx on public.partner_agreements(requirement_state);
create index if not exists partner_subscriptions_state_idx on public.partner_subscriptions(subscription_state);
create index if not exists partner_publication_eligibility_state_idx on public.partner_publication_eligibility(eligibility_state);
create index if not exists partner_user_roles_auth_user_idx on public.partner_user_roles(auth_user_id);
create index if not exists partner_user_roles_partner_role_idx on public.partner_user_roles(partner_id, role_id);
create index if not exists partner_audit_log_partner_idx on public.partner_audit_log(partner_id, occurred_at);
create index if not exists partner_audit_log_event_type_idx on public.partner_audit_log(event_type);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists partner_lifecycles_set_updated_at on public.partner_lifecycles;
drop trigger if exists partner_verifications_set_updated_at on public.partner_verifications;
drop trigger if exists agreement_versions_set_updated_at on public.agreement_versions;
drop trigger if exists partner_agreements_set_updated_at on public.partner_agreements;
drop trigger if exists partner_subscriptions_set_updated_at on public.partner_subscriptions;
drop trigger if exists partner_publication_eligibility_set_updated_at on public.partner_publication_eligibility;
drop trigger if exists partner_roles_set_updated_at on public.partner_roles;
drop trigger if exists partner_user_roles_set_updated_at on public.partner_user_roles;

create trigger partner_lifecycles_set_updated_at before update on public.partner_lifecycles for each row execute function public.set_updated_at();
create trigger partner_verifications_set_updated_at before update on public.partner_verifications for each row execute function public.set_updated_at();
create trigger agreement_versions_set_updated_at before update on public.agreement_versions for each row execute function public.set_updated_at();
create trigger partner_agreements_set_updated_at before update on public.partner_agreements for each row execute function public.set_updated_at();
create trigger partner_subscriptions_set_updated_at before update on public.partner_subscriptions for each row execute function public.set_updated_at();
create trigger partner_publication_eligibility_set_updated_at before update on public.partner_publication_eligibility for each row execute function public.set_updated_at();
create trigger partner_roles_set_updated_at before update on public.partner_roles for each row execute function public.set_updated_at();
create trigger partner_user_roles_set_updated_at before update on public.partner_user_roles for each row execute function public.set_updated_at();

alter table public.partner_lifecycles enable row level security;
alter table public.partner_verifications enable row level security;
alter table public.agreement_versions enable row level security;
alter table public.partner_agreements enable row level security;
alter table public.agreement_acceptances enable row level security;
alter table public.partner_subscriptions enable row level security;
alter table public.partner_subscription_events enable row level security;
alter table public.partner_publication_eligibility enable row level security;
alter table public.partner_roles enable row level security;
alter table public.partner_user_roles enable row level security;
alter table public.partner_audit_log enable row level security;

drop policy if exists partner_lifecycles_service_role_all on public.partner_lifecycles;
drop policy if exists partner_lifecycles_partner_read_own on public.partner_lifecycles;
create policy partner_lifecycles_service_role_all on public.partner_lifecycles for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy partner_lifecycles_partner_read_own on public.partner_lifecycles for select using (exists (select 1 from public.partners p where p.id = partner_lifecycles.partner_id and p.auth_user_id = auth.uid()));

drop policy if exists partner_verifications_service_role_all on public.partner_verifications;
drop policy if exists partner_verifications_partner_read_own on public.partner_verifications;
create policy partner_verifications_service_role_all on public.partner_verifications for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy partner_verifications_partner_read_own on public.partner_verifications for select using (exists (select 1 from public.partners p where p.id = partner_verifications.partner_id and p.auth_user_id = auth.uid()));

drop policy if exists agreement_versions_service_role_all on public.agreement_versions;
drop policy if exists agreement_versions_authenticated_read on public.agreement_versions;
create policy agreement_versions_service_role_all on public.agreement_versions for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy agreement_versions_authenticated_read on public.agreement_versions for select using (auth.role() in ('authenticated','service_role'));

drop policy if exists partner_agreements_service_role_all on public.partner_agreements;
drop policy if exists partner_agreements_partner_read_own on public.partner_agreements;
create policy partner_agreements_service_role_all on public.partner_agreements for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy partner_agreements_partner_read_own on public.partner_agreements for select using (exists (select 1 from public.partners p where p.id = partner_agreements.partner_id and p.auth_user_id = auth.uid()));

drop policy if exists agreement_acceptances_service_role_all on public.agreement_acceptances;
drop policy if exists agreement_acceptances_partner_read_own on public.agreement_acceptances;
create policy agreement_acceptances_service_role_all on public.agreement_acceptances for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy agreement_acceptances_partner_read_own on public.agreement_acceptances for select using (exists (select 1 from public.partners p where p.id = agreement_acceptances.partner_id and p.auth_user_id = auth.uid()));

drop policy if exists partner_subscriptions_service_role_all on public.partner_subscriptions;
drop policy if exists partner_subscriptions_partner_read_own on public.partner_subscriptions;
create policy partner_subscriptions_service_role_all on public.partner_subscriptions for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy partner_subscriptions_partner_read_own on public.partner_subscriptions for select using (exists (select 1 from public.partners p where p.id = partner_subscriptions.partner_id and p.auth_user_id = auth.uid()));

drop policy if exists partner_subscription_events_service_role_all on public.partner_subscription_events;
drop policy if exists partner_subscription_events_partner_read_own on public.partner_subscription_events;
create policy partner_subscription_events_service_role_all on public.partner_subscription_events for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy partner_subscription_events_partner_read_own on public.partner_subscription_events for select using (exists (select 1 from public.partners p join public.partner_subscriptions ps on ps.id = partner_subscription_events.subscription_id where ps.partner_id = p.id and p.auth_user_id = auth.uid()));

drop policy if exists partner_publication_eligibility_service_role_all on public.partner_publication_eligibility;
drop policy if exists partner_publication_eligibility_partner_read_own on public.partner_publication_eligibility;
create policy partner_publication_eligibility_service_role_all on public.partner_publication_eligibility for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy partner_publication_eligibility_partner_read_own on public.partner_publication_eligibility for select using (exists (select 1 from public.partners p where p.id = partner_publication_eligibility.partner_id and p.auth_user_id = auth.uid()));

drop policy if exists partner_roles_service_role_all on public.partner_roles;
drop policy if exists partner_roles_authenticated_read on public.partner_roles;
create policy partner_roles_service_role_all on public.partner_roles for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy partner_roles_authenticated_read on public.partner_roles for select using (auth.role() in ('authenticated','service_role'));

drop policy if exists partner_user_roles_service_role_all on public.partner_user_roles;
drop policy if exists partner_user_roles_self_read on public.partner_user_roles;
create policy partner_user_roles_service_role_all on public.partner_user_roles for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy partner_user_roles_self_read on public.partner_user_roles for select using (auth_user_id = auth.uid());

drop policy if exists partner_audit_log_service_role_all on public.partner_audit_log;
drop policy if exists partner_audit_log_partner_read_own on public.partner_audit_log;
create policy partner_audit_log_service_role_all on public.partner_audit_log for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy partner_audit_log_partner_read_own on public.partner_audit_log for select using (exists (select 1 from public.partners p where p.id = partner_audit_log.partner_id and p.auth_user_id = auth.uid()));

create or replace function public.backfill_partner_operations_phase1a()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  partner_row record;
  partner_lifecycle_state text;
  partner_verification_state text;
  subscription_state text;
  use_plan_id uuid;
  start_at timestamptz;
  end_at timestamptz;
  backfill_reference_at timestamptz;
  lifecycle_editing_allowed boolean;
  lifecycle_requires_action boolean;
  lifecycle_can_login boolean;
  lifecycle_can_view_dashboard boolean;
  lifecycle_can_manage_listings boolean;
  lifecycle_publication_blocked_reason text;
  lifecycle_financial_standing_state text;
  lifecycle_last_transition_reason text;
  audit_reason text;
  audit_before jsonb;
  audit_after jsonb;
begin
  for partner_row in select p.id, p.status, p.verification_status, p.membership_plan_id, p.editing_suspended, p.created_at, p.approved_at from public.partners p loop
    backfill_reference_at := coalesce(partner_row.approved_at, partner_row.created_at, now());
    partner_lifecycle_state := 'verification_pending';
    partner_verification_state := 'pending';
    subscription_state := 'draft';
    lifecycle_editing_allowed := false;
    lifecycle_requires_action := true;
    lifecycle_can_login := false;
    lifecycle_can_view_dashboard := false;
    lifecycle_can_manage_listings := false;
    lifecycle_publication_blocked_reason := 'legacy-status-unmapped';
    lifecycle_financial_standing_state := 'action_required';
    lifecycle_last_transition_reason := 'phase1a-backfill';
    audit_reason := null;
    audit_before := null;
    audit_after := null;

    if lower(partner_row.status) = 'suspended' then
      partner_lifecycle_state := 'suspended';
      partner_verification_state := 'suspended';
      subscription_state := 'suspended';
      lifecycle_editing_allowed := false;
      lifecycle_requires_action := true;
      lifecycle_can_login := true;
      lifecycle_can_view_dashboard := true;
      lifecycle_can_manage_listings := false;
      lifecycle_publication_blocked_reason := 'suspended-legacy';
      lifecycle_financial_standing_state := 'suspended';
      lifecycle_last_transition_reason := 'legacy-suspended';
    elsif lower(partner_row.status) = 'archived' then
      partner_lifecycle_state := 'archived';
      partner_verification_state := 'suspended';
      subscription_state := 'cancelled';
      lifecycle_editing_allowed := false;
      lifecycle_requires_action := true;
      lifecycle_can_login := false;
      lifecycle_can_view_dashboard := false;
      lifecycle_can_manage_listings := false;
      lifecycle_publication_blocked_reason := 'archived-legacy';
      lifecycle_financial_standing_state := 'restricted';
      lifecycle_last_transition_reason := 'legacy-archived';
    elsif lower(partner_row.status) = 'verified' then
      partner_lifecycle_state := 'approved';
      partner_verification_state := 'approved';
      subscription_state := 'complimentary_active';
      lifecycle_editing_allowed := true;
      lifecycle_requires_action := false;
      lifecycle_can_login := true;
      lifecycle_can_view_dashboard := true;
      lifecycle_can_manage_listings := true;
      lifecycle_publication_blocked_reason := null;
      lifecycle_financial_standing_state := 'good_standing';
      lifecycle_last_transition_reason := 'legacy-verified';
    elsif lower(partner_row.status) = 'pending' then
      partner_lifecycle_state := 'verification_pending';
      partner_verification_state := 'pending';
      subscription_state := 'draft';
      lifecycle_editing_allowed := false;
      lifecycle_requires_action := true;
      lifecycle_can_login := false;
      lifecycle_can_view_dashboard := false;
      lifecycle_can_manage_listings := false;
      lifecycle_publication_blocked_reason := 'verification-pending';
      lifecycle_financial_standing_state := 'action_required';
      lifecycle_last_transition_reason := 'legacy-pending';
    elsif lower(partner_row.status) in ('new_lead','contacted','lead') then
      partner_lifecycle_state := 'application';
      partner_verification_state := 'not_started';
      subscription_state := 'draft';
      lifecycle_editing_allowed := false;
      lifecycle_requires_action := true;
      lifecycle_can_login := false;
      lifecycle_can_view_dashboard := false;
      lifecycle_can_manage_listings := false;
      lifecycle_publication_blocked_reason := 'application-in-progress';
      lifecycle_financial_standing_state := 'action_required';
      lifecycle_last_transition_reason := 'legacy-application';
    elsif lower(partner_row.status) in ('approved','active','published') then
      partner_lifecycle_state := 'approved';
      partner_verification_state := 'approved';
      subscription_state := 'complimentary_active';
      lifecycle_editing_allowed := true;
      lifecycle_requires_action := false;
      lifecycle_can_login := true;
      lifecycle_can_view_dashboard := true;
      lifecycle_can_manage_listings := true;
      lifecycle_publication_blocked_reason := null;
      lifecycle_financial_standing_state := 'good_standing';
      lifecycle_last_transition_reason := 'legacy-approved';
    elsif lower(partner_row.status) in ('restricted','action_required') then
      partner_lifecycle_state := 'restricted';
      partner_verification_state := 'pending';
      subscription_state := 'draft';
      lifecycle_editing_allowed := false;
      lifecycle_requires_action := true;
      lifecycle_can_login := true;
      lifecycle_can_view_dashboard := true;
      lifecycle_can_manage_listings := false;
      lifecycle_publication_blocked_reason := 'restricted-legacy';
      lifecycle_financial_standing_state := 'restricted';
      lifecycle_last_transition_reason := 'legacy-restricted';
    elsif lower(partner_row.status) in ('rejected','declined','incomplete') then
      partner_lifecycle_state := 'verification_rejected';
      partner_verification_state := 'rejected';
      subscription_state := 'draft';
      lifecycle_editing_allowed := false;
      lifecycle_requires_action := true;
      lifecycle_can_login := false;
      lifecycle_can_view_dashboard := false;
      lifecycle_can_manage_listings := false;
      lifecycle_publication_blocked_reason := 'legacy-rejected';
      lifecycle_financial_standing_state := 'action_required';
      lifecycle_last_transition_reason := 'legacy-rejected';
    else
      partner_lifecycle_state := 'verification_pending';
      partner_verification_state := 'pending';
      subscription_state := 'draft';
      lifecycle_editing_allowed := false;
      lifecycle_requires_action := true;
      lifecycle_can_login := false;
      lifecycle_can_view_dashboard := false;
      lifecycle_can_manage_listings := false;
      lifecycle_publication_blocked_reason := 'legacy-status-unmapped';
      lifecycle_financial_standing_state := 'action_required';
      lifecycle_last_transition_reason := 'legacy-status-unmapped';
      audit_reason := 'legacy-status-unmapped-during-backfill';
      audit_before := jsonb_build_object('legacy_status', partner_row.status);
      audit_after := jsonb_build_object('lifecycle_state', partner_lifecycle_state, 'verification_state', partner_verification_state, 'subscription_state', subscription_state);
    end if;

    insert into public.partner_lifecycles (
      partner_id,
      lifecycle_state,
      editing_allowed,
      requires_action,
      grace_period_active,
      can_login,
      can_view_dashboard,
      can_manage_listings,
      publication_blocked_reason,
      last_transition_at,
      last_transition_reason,
      financial_standing_state
    )
    values (
      partner_row.id,
      partner_lifecycle_state,
      lifecycle_editing_allowed,
      lifecycle_requires_action,
      false,
      lifecycle_can_login,
      lifecycle_can_view_dashboard,
      lifecycle_can_manage_listings,
      lifecycle_publication_blocked_reason,
      now(),
      lifecycle_last_transition_reason,
      lifecycle_financial_standing_state
    )
    on conflict (partner_id) do nothing;

    insert into public.partner_verifications (
      partner_id,
      verification_state,
      reviewed_at,
      review_notes,
      documents_complete,
      documents_expired,
      last_checked_at
    )
    values (
      partner_row.id,
      partner_verification_state,
      case when partner_verification_state = 'approved' then backfill_reference_at else null end,
      null,
      false,
      false,
      now()
    )
    on conflict (partner_id) do nothing;

    insert into public.partner_agreements (partner_id, requirement_state, acceptance_deadline_at, accepted_version_id, accepted_at, requires_reacceptance)
    values (partner_row.id, 'not_required', null, null, null, false)
    on conflict (partner_id) do nothing;

    if not exists (select 1 from public.partner_subscriptions ps where ps.partner_id = partner_row.id) then
      use_plan_id := null;
      if partner_row.membership_plan_id is not null then
        select mp.id into use_plan_id from public.membership_plans mp where mp.id = partner_row.membership_plan_id limit 1;
      end if;

      start_at := backfill_reference_at;
      end_at := start_at + interval '3 months';
      insert into public.partner_subscriptions (
        partner_id,
        plan_id,
        subscription_state,
        billing_model,
        normal_price_amount,
        discount_percentage,
        currency,
        complimentary_start_at,
        complimentary_end_at,
        current_period_start_at,
        current_period_end_at,
        grace_end_at,
        next_billing_at,
        auto_renew,
        waiver_applied,
        waiver_reason
      )
      values (
        partner_row.id,
        use_plan_id,
        subscription_state,
        case when subscription_state = 'complimentary_active' then 'complimentary' else 'paid' end,
        null,
        case when subscription_state = 'complimentary_active' then 100.00 else 0.00 end,
        'USD',
        start_at,
        end_at,
        start_at,
        end_at,
        null,
        null,
        false,
        false,
        null
      );

      insert into public.partner_subscription_events (
        subscription_id,
        actor_auth_user_id,
        event_type,
        reason,
        payload,
        source
      )
      select ps.id, null, 'created', 'phase1a-backfill', jsonb_build_object('backfilled', true), 'migration'
      from public.partner_subscriptions ps
      where ps.partner_id = partner_row.id
      order by ps.created_at desc
      limit 1;
    end if;

    if audit_reason is not null then
      insert into public.partner_audit_log (
        partner_id,
        actor_role,
        event_type,
        entity_type,
        entity_id,
        reason,
        before_payload,
        after_payload,
        source
      )
      select partner_row.id, 'system', 'admin.override', 'partner', partner_row.id::text, audit_reason, audit_before, audit_after, 'migration'
      where not exists (
        select 1 from public.partner_audit_log pal
        where pal.partner_id = partner_row.id
          and pal.event_type = 'admin.override'
          and pal.reason = audit_reason
      );
    end if;
  end loop;
end;
$$;

comment on function public.backfill_partner_operations_phase1a() is 'Additive Phase 1A backfill that must be invoked manually after the schema migration.';

insert into public.partner_roles (code, display_name, description, is_system_role, active)
values
  ('platform_owner','Platform owner','Full platform authority', true, true),
  ('admin','Admin','Operational admin for partner management', true, true),
  ('finance','Finance','Financial oversight and statement review', true, true),
  ('partner_owner','Partner owner','Primary owner for a partner account', true, true),
  ('partner_staff','Partner staff','Limited partner account access', true, true)
on conflict (code) do nothing;

commit;
