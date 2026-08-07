-- Persist the canonical public WhatsApp number for Food Land.
update public.restaurants
set whatsapp = '+960 987-9911',
    updated_at = timezone('utc', now())
where slug = 'food-land';
