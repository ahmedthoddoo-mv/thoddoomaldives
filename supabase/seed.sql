-- Production-safe seed.
-- Real businesses must be added through the admin dashboard after owner
-- verification. No properties, partners, restaurants, experiences, transfers,
-- bookings, guests, CRM records, or media assets are created here.

insert into public.membership_plans (name, price_label, description, features, active)
values
  ('Free', 'Free', 'Basic listing for a real, owner-approved business.', array['Basic listing'], true),
  ('Verified', 'Contact us', 'Verified listing after identity and business checks.', array['Verified badge', 'Direct contact'], true),
  ('Premium', 'Contact us', 'Premium visibility for an approved business.', array['Featured placement', 'Priority support'], true)
on conflict (name) do update set
  price_label = excluded.price_label,
  description = excluded.description,
  features = excluded.features,
  active = excluded.active;
