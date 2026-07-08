# iThoddoo Maldives Styleguide

## Brand Feel

The product should feel modern, premium, trustworthy, local, tropical, and mobile-first. It should help guests feel confident that real local people can help them plan a smooth Thoddoo trip.

## Colors

Primary palette:
- White: `bg-white`, clean page backgrounds.
- Slate 900/950: primary text, dark sections, strong buttons.
- Slate 600/700: body copy and secondary text.
- Slate 50/100: soft section backgrounds and subtle UI surfaces.
- Cyan 700: section eyebrows, links, and island accent color.
- Green 500/600: WhatsApp and booking actions.

Usage:
- Use green only for WhatsApp or booking actions.
- Use cyan for travel/category accents.
- Use slate for structure, readability, and contrast.
- Avoid heavy one-color pages.
- Avoid decorative gradients that do not support content.

## Typography

Current font setup:
- Next font variables from Geist in `app/layout.tsx`.
- Global CSS currently falls back to Arial/Helvetica.

Scale:
- Hero titles: `text-5xl md:text-7xl`
- Section titles: `text-4xl`
- Card titles: `text-2xl` or `text-3xl`
- Body text: `text-base`, `text-lg`
- Eyebrows: uppercase, small, bold, wide tracking

Rules:
- Keep text readable on mobile.
- Do not use negative letter spacing.
- Avoid very long hero copy.
- Use clear, direct travel language.

## Buttons

Primary dark:
- Use for general actions.
- Example: `bg-slate-900 text-white`

WhatsApp green:
- Use only for WhatsApp or booking conversion.
- Example: `bg-green-500 text-white hover:bg-green-600`

Light:
- Use on dark hero sections.
- Example: `bg-white text-slate-900`

Outline:
- Use as secondary action on image/dark sections.
- Example: `border border-white text-white`

Rules:
- Buttons should be obvious links or actions.
- Booking buttons should open WhatsApp with useful context.
- Use rounded buttons consistently.
- Avoid too many competing CTAs in one section.

## Cards

Card pattern:
- `rounded-3xl`
- `border`
- `bg-white`
- `shadow-sm`
- add hover shadow only for clickable cards

Rules:
- Use cards for repeated objects such as properties, rooms, excursions, and contact methods.
- Do not nest cards inside cards.
- Keep card content scannable.
- Use images for properties, rooms, restaurants, and experiences when available.

## Spacing

Page sections:
- Standard vertical padding: `py-16` or `py-20`
- Container width: use `Container` or `mx-auto max-w-* px-6`
- Grid gaps: `gap-6`, `gap-8`, `gap-10`

Rules:
- Use generous space for public marketing pages.
- Keep operational or form sections tighter.
- Maintain consistent section rhythm.

## Mobile-First Rules

- Design for mobile first, then enhance for tablet and desktop.
- Use single-column layouts by default.
- Add responsive grids with `md:` and `lg:` breakpoints.
- Avoid fixed heights that crop important content on mobile.
- Ensure buttons wrap cleanly.
- Keep tap targets comfortable.
- Test important pages at phone width.

## Naming Conventions

Files:
- Components use PascalCase: `PropertyPage.tsx`.
- Pages use App Router conventions: `page.tsx`.
- Data files use camelCase or domain names: `guesthouses.ts`.
- Types use domain names: `guesthouse.ts`.

Components:
- Reusable visual components should describe what they render.
- Domain components should include the domain name, such as `PropertyRoomCard`.
- UI primitives should stay generic, such as `Button`, `Card`, and `Badge`.

Data:
- Slugs should be lowercase kebab-case.
- IDs should be stable and usually match slugs.
- Guesthouse records should match the `Guesthouse` type.

Code:
- Prefer clear prop names.
- Keep business data out of JSX where a data module exists.
- Use shared helpers for WhatsApp URLs.
