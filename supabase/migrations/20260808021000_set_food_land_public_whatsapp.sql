-- Persist the canonical public WhatsApp number for Food Land.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'restaurants'
      and column_name = 'whatsapp'
  ) then
    update public.restaurants
    set whatsapp = '+960 987-9911',
        updated_at = timezone('utc', now())
    where slug = 'food-land';
  end if;
end $$;
