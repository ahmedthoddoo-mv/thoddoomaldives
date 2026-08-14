begin;

create or replace function public.enforce_partner_role_scope()
returns trigger
language plpgsql
as $$
declare
  role_scope text;
begin
  select pr.scope_type into role_scope
  from public.partner_roles pr
  where pr.id = new.role_id;

  if role_scope is null then
    raise exception 'role_id % is not mapped to a valid scope', new.role_id;
  end if;

  if role_scope = 'platform' and new.partner_id is not null then
    raise exception 'platform-scoped roles must have partner_id null';
  end if;

  if role_scope = 'partner' and new.partner_id is null then
    raise exception 'partner-scoped roles must have partner_id set';
  end if;

  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'partner_roles' and column_name = 'scope_type') then
    alter table public.partner_roles add column scope_type text;
  end if;
end $$;

update public.partner_roles
set scope_type = case code
  when 'platform_owner' then 'platform'
  when 'admin' then 'platform'
  when 'finance' then 'platform'
  when 'partner_owner' then 'partner'
  when 'partner_staff' then 'partner'
  else null
end
where scope_type is null;

alter table public.partner_roles
  alter column scope_type set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'partner_roles_scope_type_check') then
    alter table public.partner_roles
      add constraint partner_roles_scope_type_check check (scope_type in ('platform', 'partner'));
  end if;
end $$;

alter table public.partner_user_roles alter column partner_id drop not null;

drop trigger if exists partner_user_roles_scope_check on public.partner_user_roles;
create trigger partner_user_roles_scope_check
before insert or update on public.partner_user_roles
for each row execute function public.enforce_partner_role_scope();

drop index if exists partner_user_roles_partner_role_idx;
create unique index if not exists partner_user_roles_platform_scope_active_idx
  on public.partner_user_roles(auth_user_id, role_id)
  where partner_id is null and active is true;

create unique index if not exists partner_user_roles_partner_scope_active_idx
  on public.partner_user_roles(auth_user_id, partner_id, role_id)
  where partner_id is not null and active is true;

create index if not exists partner_user_roles_partner_scope_lookup_idx
  on public.partner_user_roles(partner_id, role_id);

create temporary table if not exists role_scope_corrections (
  assignment_id uuid,
  role_code text,
  previous_partner_id uuid
) on commit drop;

insert into role_scope_corrections (assignment_id, role_code, previous_partner_id)
select pur.id, pr.code, pur.partner_id
from public.partner_user_roles pur
join public.partner_roles pr on pr.id = pur.role_id
where pr.code in ('platform_owner', 'admin', 'finance')
and pur.partner_id is not null;

update public.partner_user_roles pur
set partner_id = null
from role_scope_corrections rsc
where pur.id = rsc.assignment_id;

insert into public.partner_audit_log (
  partner_id,
  actor_auth_user_id,
  actor_role,
  event_type,
  entity_type,
  entity_id,
  reason,
  before_payload,
  after_payload,
  source,
  correlation_id
)
select
  rsc.previous_partner_id,
  null,
  'system',
  'role_scope_corrected',
  'partner_user_role',
  rsc.assignment_id::text,
  'role_scope_architecture_fix',
  jsonb_build_object('role_code', rsc.role_code, 'partner_id', rsc.previous_partner_id),
  jsonb_build_object('role_code', rsc.role_code, 'partner_id', null),
  'migration',
  'partner-role-scope-' || rsc.assignment_id::text
from role_scope_corrections rsc;

commit;
