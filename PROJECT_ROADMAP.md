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
- Version 1.0 real data preparation with repository adapters, platform configuration, and CSV import/export helpers.

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

## EPIC-027 - Real Data Preparation

Status: COMPLETED

Completed preparation work:
- Added repository adapters under `lib/repositories/` for partners, properties, bookings, restaurants, experiences, transfers, media, CRM, and analytics.
- Standardized repository methods: `findAll()`, `findById()`, `findBySlug()`, `findFeatured()`, `findVerified()`, and `search()`.
- Moved public stay pages, sitemap, trip planner, booking widgets, admin properties, admin bookings, media library, CRM panels, and partner analytics/profile media lookups onto repository methods.
- Added central platform configuration under `lib/config/platform.ts` for brand, island, currency, timezone, WhatsApp numbers, company contact, support email, social links, and expansion flags.
- Added CSV helpers under `lib/csv/` for exporting current partner data and parsing future partner imports.
- Kept UI and mock data unchanged while creating a replacement boundary for future Supabase-backed implementations.

## Version 1.0 Progress

Completed:
- Public discovery website and core SEO surfaces.
- Partner Program, onboarding, booking inquiry demo, admin dashboard, admin CMS, media library, property management, partner portal, CRM, and platform integration.
- Repository/data boundary for replacing demo arrays with persistent records.

Technical debt:
- Admin demo protection still uses a temporary password gate and must be replaced before production.
- Editor schemas and route-specific mock form configs still live in `data/` and should become repository-backed CMS schemas when persistence is introduced.
- Media upload, booking persistence, analytics events, and partner authentication are placeholders.
- Public excursion content still uses the richer route-specific content model in `lib/experiences.ts`; consolidate with the shared Experience repository before real imports.

Next milestones:
- Supabase schema and migrations for partners, properties, rooms, bookings, guests, CRM records, notes, tasks, media assets, memberships, and analytics events.
- Repository implementation swap from mock arrays to Supabase queries.
- Role-based admin and partner authentication.
- Storage provider integration for media assets.
- Real booking inquiry persistence and analytics event capture.

## Next Recommended Epics

1. EPIC-028 - Database Schema and Data Model
   - Define Supabase/PostgreSQL tables for partners, properties, rooms, bookings, guests, CRM records, tasks, notes, media assets, memberships, analytics events, and admin users.

2. EPIC-029 - Authentication and Permissions
   - Replace demo admin gate with real admin authentication.
   - Add partner login and partner-scoped access control.

3. EPIC-030 - Storage Integration
   - Connect Media Library and Partner Gallery to Cloudflare R2, Supabase Storage, or equivalent storage service.

4. EPIC-031 - Real Booking Persistence
   - Persist booking inquiries, guest records, commission calculations, and WhatsApp lead events.

5. EPIC-032 - Analytics Events
   - Track page views, WhatsApp clicks, booking requests, partner profile views, and media usage.
