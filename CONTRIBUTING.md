# Contributing to iThoddoo Maldives

## Development Principles

iThoddoo Maldives should stay clean, scalable, mobile-first, and easy for a small local team to maintain. New work should move the project toward reusable platform patterns instead of one-off hardcoded pages.

## Local Commands

Use:

```bash
npm run dev
npm run lint
npm run build
```

Before publishing important changes, run:

```bash
npm run lint
npm run build
```

## Reusable Components

Rules:
- Build shared UI once and reuse it.
- Put generic UI in `components/ui/`.
- Put domain-specific property UI in `components/property/`.
- Avoid copying large JSX blocks between pages.
- If a card, button, section title, or layout repeats, create or reuse a component.

Preferred pattern:
1. Add or update a type in `types/`.
2. Add or update records in `data/`.
3. Render through reusable components.
4. Keep pages focused on routing and composition.

## TypeScript

Rules:
- Use TypeScript for all app and component code.
- Import shared types from `types/`.
- Keep data objects aligned with their exported types.
- Avoid `any` unless there is a clear reason.
- Type route params according to the current Next.js App Router API.

## TailwindCSS

Rules:
- Use Tailwind utility classes for styling.
- Follow existing color and spacing patterns.
- Keep responsive styles mobile-first.
- Prefer small reusable components over custom CSS.
- Add global CSS only for true global behavior.

## No Duplicated UI

Do not create a separate hardcoded page when a dynamic route can render from data.

Examples:
- Add guesthouses to `data/guesthouses.ts`.
- Render guesthouses through `/stay/[slug]`.
- Use `PropertyPage`, `PropertyRoomCard`, and `PropertyAmenities`.
- Use `lib/whatsapp.ts` for WhatsApp links.

## Clean Architecture

Keep responsibilities clear:
- `app/` owns routes and route metadata.
- `components/` owns reusable UI.
- `data/` owns temporary local content records.
- `lib/` owns helper functions and shared domain utilities.
- `types/` owns TypeScript domain types.
- `public/` owns static images and assets.

Avoid:
- Business data hardcoded directly into pages.
- Large duplicated sections across pages.
- Mixing admin-only logic into public components.
- Unclear helper names.
- Unused components or dead routes.

## Mobile First

Every public page must work well on phones.

Rules:
- Start with single-column layout.
- Add `md:` and `lg:` enhancements only after mobile works.
- Keep text readable and buttons tappable.
- Avoid horizontal scrolling.
- Make booking actions easy to find.
- Check hero sections on small screens.

## Content Rules

- Use clear travel language.
- Keep claims accurate.
- Do not invent prices, schedules, or availability.
- Mention that transfers and excursions may depend on weather or operator schedules when relevant.
- Use real property and room images whenever possible.

## Publishing Rules

Before publishing:
- Review changed files with `git status --short`.
- Commit only the intended files.
- Do not include unrelated local changes.
- Run `npm run lint`.
- Run `npm run build`.
- Push to `origin/main` only when the change is ready for the live site.
