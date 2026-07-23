-- Start the production directory completely empty.
-- Partner applications are intentionally preserved so the owner can review
-- genuine submissions and create approved business records from them.

delete from public.partner_account_invitations;
delete from public.partner_audit_events;
delete from public.partner_notifications;
delete from public.partner_documents;
delete from public.partner_service_items;
delete from public.property_media;
delete from public.partner_media;
delete from public.crm_notes;
delete from public.crm_tasks;
delete from public.bookings;
delete from public.guests;
delete from public.rooms;
delete from public.properties;
delete from public.partners;
delete from public.restaurants;
delete from public.experiences;
delete from public.transfers;
delete from public.media_assets;
