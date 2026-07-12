-- Adds public property read fields needed by the Supabase-backed /stay pages.
-- Safe to run after the foundation migration has already been applied.

alter table public.properties
  add column if not exists amenities text[] not null default '{}';

alter table public.properties
  add column if not exists policies text[] not null default '{}';
