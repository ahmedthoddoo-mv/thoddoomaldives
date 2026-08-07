-- Restaurant interactive menu + membership linkage

alter table public.restaurants
  add column if not exists membership_plan_id uuid references public.membership_plans(id) on delete set null;

create table if not exists public.restaurant_menu_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  slug text,
  sort_order integer not null default 0,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.restaurant_menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id uuid not null references public.restaurant_menu_categories(id) on delete cascade,
  name text not null,
  description text,
  price_mvr numeric(10,2),
  sort_order integer not null default 0,
  is_available boolean not null default true,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists restaurant_menu_categories_restaurant_id_idx
  on public.restaurant_menu_categories(restaurant_id, sort_order);
create index if not exists restaurant_menu_items_restaurant_id_idx
  on public.restaurant_menu_items(restaurant_id, sort_order);
create index if not exists restaurant_menu_items_category_id_idx
  on public.restaurant_menu_items(category_id, sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists restaurant_menu_categories_set_updated_at on public.restaurant_menu_categories;
create trigger restaurant_menu_categories_set_updated_at
  before update on public.restaurant_menu_categories
  for each row execute function public.set_updated_at();

drop trigger if exists restaurant_menu_items_set_updated_at on public.restaurant_menu_items;
create trigger restaurant_menu_items_set_updated_at
  before update on public.restaurant_menu_items
  for each row execute function public.set_updated_at();

alter table public.restaurant_menu_categories enable row level security;
alter table public.restaurant_menu_items enable row level security;

drop policy if exists "public read public restaurant menu categories" on public.restaurant_menu_categories;
create policy "public read public restaurant menu categories"
  on public.restaurant_menu_categories for select
  using (
    is_public = true and
    exists (
      select 1
      from public.restaurants r
      where r.id = restaurant_menu_categories.restaurant_id
        and r.publication_status = 'published'
        and r.verification_status = 'verified'
    )
  );

drop policy if exists "public read public restaurant menu items" on public.restaurant_menu_items;
create policy "public read public restaurant menu items"
  on public.restaurant_menu_items for select
  using (
    is_public = true and
    exists (
      select 1
      from public.restaurant_menu_categories c
      join public.restaurants r on r.id = c.restaurant_id
      where c.id = restaurant_menu_items.category_id
        and c.is_public = true
        and r.publication_status = 'published'
        and r.verification_status = 'verified'
    )
  );

drop policy if exists "partners manage their restaurant menu categories" on public.restaurant_menu_categories;
create policy "partners manage their restaurant menu categories"
  on public.restaurant_menu_categories for all
  using (
    exists (
      select 1
      from public.restaurants r
      join public.partners p on p.id = r.partner_id
      where r.id = restaurant_menu_categories.restaurant_id
        and p.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.restaurants r
      join public.partners p on p.id = r.partner_id
      where r.id = restaurant_menu_categories.restaurant_id
        and p.auth_user_id = auth.uid()
    )
  );

drop policy if exists "partners manage their restaurant menu items" on public.restaurant_menu_items;
create policy "partners manage their restaurant menu items"
  on public.restaurant_menu_items for all
  using (
    exists (
      select 1
      from public.restaurants r
      join public.partners p on p.id = r.partner_id
      where r.id = restaurant_menu_items.restaurant_id
        and p.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.restaurants r
      join public.partners p on p.id = r.partner_id
      where r.id = restaurant_menu_items.restaurant_id
        and p.auth_user_id = auth.uid()
    )
  );

grant select on public.restaurant_menu_categories to anon, authenticated;
grant select on public.restaurant_menu_items to anon, authenticated;

drop view if exists public.public_restaurants;

create view public.public_restaurants with (security_invoker = true) as
  select
    r.id, r.slug, r.name, r.description, r.cuisine,
    r.location, r.price_range, r.opening_hours,
    r.phone, r.whatsapp, r.email, r.website, r.instagram, r.facebook,
    r.address, r.latitude, r.longitude,
    r.image_path, r.featured,
    r.publication_status, r.verification_status,
    r.application_id, r.partner_id,
    r.membership_plan_id,
    mp.name as membership_plan_name,
    p.whatsapp as partner_whatsapp,
    r.created_at, r.updated_at
  from public.restaurants r
  left join public.partners p on p.id = r.partner_id
  left join public.membership_plans mp on mp.id = r.membership_plan_id
  where r.publication_status = 'published'
    and r.verification_status = 'verified';

grant select on public.public_restaurants to anon, authenticated;
