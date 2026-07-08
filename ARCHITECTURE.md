# iThoddoo Maldives Architecture

## Overview

iThoddoo Maldives is a Next.js 16 App Router application. The current architecture favors static rendering, local TypeScript data, reusable UI components, and WhatsApp-based conversion flows. The platform should evolve toward database-backed content and admin-managed records without changing the public page structure too much.

## App Router Structure

Routes live in `app/`.

Current route groups:
- `/` - homepage.
- `/about` - island overview.
- `/contact` - contact and trip planning.
- `/excursions` - excursions and activities.
- `/experiences` - experience content.
- `/gallery` - visual gallery.
- `/guide` - local travel guide.
- `/restaurants` - restaurant discovery.
- `/stay` - guesthouse listing.
- `/stay/[slug]` - dynamic guesthouse property page.
- `/transfer` - transfer information.

The root layout in `app/layout.tsx` owns shared page chrome:
- `Navbar`
- page content
- `Footer`
- floating `WhatsAppButton`
- global fonts and metadata

## Components

Reusable components live in `components/`.

Shared app components:
- `Navbar`
- `Footer`
- `HeroSlider`
- `WhatsAppButton`
- `BookButton`
- inquiry forms

Property components:
- `components/property/PropertyPage.tsx`
- `components/property/PropertyRoomCard.tsx`
- `components/property/PropertyAmenities.tsx`

UI primitives:
- `components/ui/Button.tsx`
- `components/ui/Card.tsx`
- `components/ui/Badge.tsx`
- `components/ui/Container.tsx`
- `components/ui/SectionTitle.tsx`

Rule: pages should compose components instead of duplicating large UI blocks.

## Data Layer

Current data is stored in TypeScript modules:
- `data/guesthouses.ts`
- `lib/experiences.ts`
- `lib/whatsapp.ts`

Types live in:
- `types/guesthouse.ts`

Current pattern:
1. Define the data shape in `types/`.
2. Store records in `data/`.
3. Use helper functions such as `getGuesthouseBySlug()`.
4. Render records through reusable components.

Future pattern:
1. Move records to a database or CMS.
2. Keep TypeScript types as the app contract.
3. Replace local data imports with server-side data access helpers.
4. Keep public pages and components mostly unchanged.

## Dynamic Routing

Guesthouse pages use the dynamic route:

```text
app/stay/[slug]/page.tsx
```

The route:
- receives `params.slug`
- finds the matching guesthouse from `data/guesthouses.ts`
- returns `notFound()` for unknown slugs
- generates metadata per guesthouse
- uses `generateStaticParams()` to prerender known property pages
- renders `PropertyPage` with `guesthouse`

This lets new guesthouses be added by updating `data/guesthouses.ts` instead of creating a new page file.

## UI System

The UI system is Tailwind-first with small reusable components.

Core rules:
- Use shared UI primitives where possible.
- Keep cards, buttons, section headings, and layout containers consistent.
- Prefer readable utility class composition over custom CSS.
- Keep pages mobile-first.
- Use real images for inspectable places, rooms, restaurants, and activities.
- Keep WhatsApp booking actions clear and easy to find.

## Future Admin Dashboard

The future Admin Dashboard should manage platform data without requiring code edits.

Potential admin modules:
- Properties
- Rooms
- Amenities
- Excursions
- Transfers
- Restaurants
- Gallery images
- Leads and WhatsApp inquiries
- Homepage featured content
- SEO metadata

Suggested architecture:
- Protected `/admin` route group.
- Authentication and role-based access.
- Database-backed data models.
- Server actions or route handlers for mutations.
- Image upload workflow for property and activity media.
- Audit-friendly content updates.

The public website should read from the same data source used by the dashboard.

## AI Concierge Architecture

The AI Concierge should help travelers plan Thoddoo trips using structured site data.

Suggested modules:
- Chat interface on public site.
- Retrieval layer over guesthouses, excursions, transfers, restaurants, and guides.
- Booking handoff to WhatsApp or future checkout.
- Admin-managed knowledge base.
- Lead capture for unresolved or high-intent requests.

Possible flow:
1. Guest asks a trip planning question.
2. Concierge retrieves relevant island, stay, transfer, and excursion data.
3. Concierge suggests an itinerary or booking option.
4. Guest can continue to WhatsApp with a prefilled message.
5. Lead is stored for follow-up in the Admin Dashboard.

Important rules:
- The AI should use approved platform data, not invent prices or schedules.
- Time-sensitive information should be confirmed before booking.
- WhatsApp handoff should include useful context for the local team.
