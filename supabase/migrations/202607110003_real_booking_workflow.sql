-- EPIC-039 real booking workflow additions.
-- Safe additive migration for the already-deployed Project Atlas foundation schema.

alter table public.bookings
  add column if not exists booking_reference text,
  add column if not exists contact_preference text not null default 'whatsapp',
  add column if not exists taxes_fees numeric(12, 2) not null default 0,
  add column if not exists room_prepared boolean not null default false,
  add column if not exists internal_notes text;

create unique index if not exists bookings_booking_reference_key
  on public.bookings(booking_reference)
  where booking_reference is not null;

create index if not exists bookings_partner_status_idx
  on public.bookings(partner_id, booking_status);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'bookings_contact_preference_check') then
    alter table public.bookings add constraint bookings_contact_preference_check
      check (contact_preference in ('whatsapp', 'email', 'either'));
  end if;
end $$;
