# Changelog

All notable changes to iThoddoo Maldives will be documented in this file.

## Unreleased

### Added
- Project documentation files for product, roadmap, architecture, style, changelog, and contributing guidance.
- `TASKS.md` for active project task tracking.

### Changed
- Dynamic property platform work is prepared locally for review.

## 2026-07-08

### Added
- Expanded contact page with clearer trip planning content.
- Added contact phone display with `Adhu: +960 914 2538`.
- Added metadata for the contact page.
- Added reusable WhatsApp link usage on the contact page.

### Published
- Contact page update published to `origin/main`.

## Alpha Milestone

### Added
- Next.js App Router project foundation.
- Homepage, about, contact, excursions, transfer, stay, gallery, guide, restaurants, and experiences pages.
- Shared layout with navbar, footer, and floating WhatsApp button.
- Basic local travel content for Thoddoo Island.
- Guesthouse data model in `types/guesthouse.ts`.
- Guesthouse data source in `data/guesthouses.ts`.
- Property components for rooms, amenities, and property pages.
- WhatsApp helper functions in `lib/whatsapp.ts`.

## Dynamic Property Platform Milestone

### Added
- Reusable `PropertyPage` component receiving `guesthouse: Guesthouse`.
- Data-driven `/stay` listing.
- Dynamic `/stay/[slug]` guesthouse route.
- Static path generation for guesthouse slugs.
- Dynamic property metadata.
- 404 handling for missing guesthouse slugs.

### Removed
- Hardcoded one-off guesthouse page for `/stay/thoddoo-sun-sky-inn`.
