# Project Atlas Roadmap

## Current Status

Project Atlas is now a connected frontend demo platform for iThoddoo Maldives.

Completed platform foundations:
- Public website, SEO, sitemap, robots, guide, gallery, stays, restaurants, transfers, experiences, and contact surfaces.
- Partner Program landing page and Growth Partner onboarding.
- Booking and inquiry engine foundation with WhatsApp submission and commission demo calculations.
- Admin Dashboard foundation with password-gated demo protection.
- Admin CMS for guesthouses, restaurants, experiences, transfers, properties, and media.
- Property Management System with add/edit/demo publication workflows.
- Media Library and Asset Manager with metadata, detail pages, tags, usage, and upload placeholders.
- Partner Portal with dashboard, profile, bookings, calendar, rooms, gallery, pricing, and analytics.
- Partner CRM with partner records, tasks, notes, follow-ups, membership, verification, and priority tracking.
- Platform Integration layer connecting property management, booking engine, CRM, partner portal, and media library through typed mock relationships.

## EPIC-026 - Platform Integration

Status: COMPLETED

Completed integration work:
- Properties reference rooms, gallery, amenities, booking records, CRM partner, media assets, membership, and analytics through mock relationship IDs.
- Bookings include mock links to property, partner, CRM record, guest record, and commission calculation.
- CRM records reference linked properties, bookings, notes, tasks, membership, and media.
- Partner dashboard displays linked properties, bookings, gallery/media, membership, and analytics.
- Admin dashboard displays latest bookings, latest partners, latest uploads, tasks, pending approvals, and a connected operations view.
- Media picker placeholders are available in Admin CMS editors and Partner profile workflows.
- Platform selectors, repositories, relationships, and metrics are available under `lib/platform/` as a future Supabase/PostgreSQL replacement boundary.

## Next Recommended Epics

1. EPIC-027 - Database Schema and Data Model
   - Define Supabase/PostgreSQL tables for partners, properties, rooms, bookings, guests, CRM records, tasks, notes, media assets, memberships, analytics events, and admin users.

2. EPIC-028 - Authentication and Permissions
   - Replace demo admin gate with real admin authentication.
   - Add partner login and partner-scoped access control.

3. EPIC-029 - Storage Integration
   - Connect Media Library and Partner Gallery to Cloudflare R2, Supabase Storage, or equivalent storage service.

4. EPIC-030 - Real Booking Persistence
   - Persist booking inquiries, guest records, commission calculations, and WhatsApp lead events.

5. EPIC-031 - Analytics Events
   - Track page views, WhatsApp clicks, booking requests, partner profile views, and media usage.
