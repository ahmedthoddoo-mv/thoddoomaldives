-- Secure iThoddoo owner/admin authorization.
-- Create the Supabase Auth user first, then insert that user's UUID here.

create table if not exists public.admin_users (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'admin_users_role_check') then
    alter table public.admin_users add constraint admin_users_role_check
      check (role in ('owner', 'admin'));
  end if;
end $$;

create unique index if not exists admin_users_email_lower_idx
  on public.admin_users(lower(email));

alter table public.admin_users enable row level security;

drop policy if exists "Admins can read own authorization" on public.admin_users;
create policy "Admins can read own authorization"
  on public.admin_users
  for select using (auth_user_id = auth.uid() and is_active = true);

drop policy if exists "Service role can manage admin users" on public.admin_users;
create policy "Service role can manage admin users"
  on public.admin_users
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public.partner_account_invitations
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

create index if not exists partner_account_invitations_auth_user_id_idx
  on public.partner_account_invitations(auth_user_id);
