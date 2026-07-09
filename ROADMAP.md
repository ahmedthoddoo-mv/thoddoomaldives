# iThoddoo Maldives Roadmap

## Alpha

Goal: Build the first public version of the travel site.

Completed or in progress:
- Homepage with hero content and core navigation.
- Excursions page with local experiences.
- Transfer page with transport options.
- Contact page with WhatsApp conversion path.
- Stay section with guesthouse content.
- Dynamic property platform using `data/guesthouses.ts`.
- Shared UI components for cards, badges, containers, and section titles.

Exit criteria:
- Main pages are mobile-friendly.
- WhatsApp links work correctly.
- One guesthouse can be rendered from structured data.
- Lint and production build pass.

## Beta

Goal: Turn the site into a stronger booking and discovery platform.

Current:
- EPIC-017 Booking & Inquiry Engine Foundation is IN PROGRESS.
- Frontend/demo booking widgets, live estimates, commission preparation, admin booking management, and partner dashboard demos are now scaffolded for future Supabase/PostgreSQL integration.

Planned:
- Add missing property and room images.
- Add more guesthouses to `data/guesthouses.ts`.
- Improve property gallery presentation.
- Add restaurant, shop, and attraction data models.
- Add reusable listing components for local businesses.
- Improve SEO metadata across all main routes.
- Add stronger empty states and fallback images.
- Add analytics for WhatsApp clicks and page views.
- Add basic lead tracking strategy.

Exit criteria:
- Multiple properties are live.
- Each property uses the reusable `PropertyPage`.
- Main booking flows are measurable.
- Site feels complete on mobile and desktop.

## Version 1.0

Goal: Launch as a reliable public travel platform for Thoddoo.

Planned:
- Production-ready property marketplace.
- Excursion marketplace with structured data.
- Transfer schedule and booking information.
- Complete local guide pages.
- Strong SEO for stays, excursions, transfers, and guides.
- Clear business contact and partner onboarding flow.
- Polished responsive UI system.
- Changelog and contribution process maintained.

Exit criteria:
- Site is ready for real marketing traffic.
- Adding a guesthouse does not require a custom page.
- Adding an excursion follows a clear data/component pattern.
- All core pages pass build and lint checks.

## Future Versions

Future platform expansion:
- Admin Dashboard for managing properties, rooms, excursions, transfers, and leads.
- AI Concierge for guest trip planning and local recommendations.
- Multilingual support for key visitor languages.
- Online payments or booking deposits.
- Operator accounts for guesthouses and excursion providers.
- Interactive island map.
- Dynamic availability and pricing.
- Review and rating system.
- Nearby island expansion.
- CRM-style lead management.
- Email and WhatsApp automation.
