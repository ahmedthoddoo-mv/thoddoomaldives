begin;

do $$
declare
  protected_table text;
begin
  foreach protected_table in array array[
    'partners', 'properties', 'rooms', 'partner_service_items',
    'partner_documents', 'bookings', 'media_assets', 'property_media', 'partner_media'
  ]
  loop
    if has_table_privilege('authenticated', 'public.' || protected_table, 'INSERT')
      or has_table_privilege('authenticated', 'public.' || protected_table, 'UPDATE')
      or has_table_privilege('authenticated', 'public.' || protected_table, 'DELETE') then
      raise exception 'authenticated retains direct mutation privilege on public.%', protected_table;
    end if;
  end loop;

  if has_function_privilege(
    'authenticated',
    'public.admin_save_property(uuid,uuid,jsonb,jsonb,jsonb)',
    'EXECUTE'
  ) then
    raise exception 'authenticated can execute admin_save_property';
  end if;

  if has_function_privilege(
    'authenticated',
    'public.approve_partner_application(uuid,uuid,text,boolean,text)',
    'EXECUTE'
  ) then
    raise exception 'authenticated can execute approve_partner_application';
  end if;
end
$$;

rollback;
