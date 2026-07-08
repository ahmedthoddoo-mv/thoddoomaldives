# iThoddoo Maldives

iThoddoo Maldives is a local-first travel platform for Thoddoo Island, Maldives. The project helps travelers discover stays, excursions, transfers, restaurants, guides, and practical island information, with WhatsApp-first booking flows and a roadmap toward a scalable local island marketplace.

## Vision

Build the trusted digital platform for Maldives local island tourism, starting with Thoddoo and expanding island by island through local partnerships, structured inventory, and high-quality guest support.

## Features

- Mobile-first destination website for Thoddoo Island.
- Homepage, about, contact, gallery, guide, restaurants, transfers, and excursions pages.
- WhatsApp booking and inquiry flows.
- Dynamic guesthouse platform powered by structured TypeScript data.
- Reusable property page, room card, and amenities components.
- Shared UI primitives for buttons, cards, badges, containers, and section titles.
- Project documentation for product, architecture, roadmap, brand, and operations.

## Tech Stack

- Next.js 16 with App Router.
- React 19.
- TypeScript.
- TailwindCSS.
- Local TypeScript data modules.
- WhatsApp link generation helpers.

## Installation

Install dependencies:

```bash
npm install
```

## Development

Start the local development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Build

Run lint checks:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Start the production server after building:

```bash
npm run start
```

## Deployment

The live domain is:

```text
https://thoddoomaldives.com
```

Typical deployment flow:

1. Review changed files with `git status --short`.
2. Run `npm run lint`.
3. Run `npm run build`.
4. Commit only the intended files.
5. Push to `origin/main`.
6. Confirm the deployed site on the live domain.

## Folder Structure

```text
app/                    App Router pages, layouts, icons, and global CSS
components/             Shared React components
components/property/    Property marketplace components
components/ui/          Reusable UI primitives
data/                   Local structured data
docs/                   Supporting project documents
lib/                    Shared helpers and domain utilities
public/                 Static images and public assets
scripts/                Project utility scripts
types/                  Shared TypeScript types
```

## Roadmap

Current product direction:

- Complete the dynamic property platform.
- Add high-quality property and room images.
- Add more guesthouses and local partners.
- Improve SEO and conversion tracking.
- Prepare an Admin Dashboard for managing properties, excursions, transfers, and leads.
- Prepare an AI Concierge for guest trip planning.
- Expand the platform across more Maldives local islands.

See [ROADMAP.md](./ROADMAP.md) for the full roadmap.

## Documentation

Core project documents:

- [PROJECT.md](./PROJECT.md)
- [ROADMAP.md](./ROADMAP.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [STYLEGUIDE.md](./STYLEGUIDE.md)
- [TASKS.md](./TASKS.md)
- [INVESTOR_VISION.md](./INVESTOR_VISION.md)
- [BRAND_GUIDELINES.md](./BRAND_GUIDELINES.md)
- [CEO_PLAYBOOK.md](./CEO_PLAYBOOK.md)
- [CHANGELOG.md](./CHANGELOG.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)

Additional docs:

- [docs/PROJECT_BRIEF.md](./docs/PROJECT_BRIEF.md)

## Contributing

Follow the repository rules in [CONTRIBUTING.md](./CONTRIBUTING.md). In short:

- Use reusable components.
- Keep TypeScript types clean.
- Prefer Tailwind utility classes.
- Avoid duplicated UI.
- Keep architecture simple and data-driven.
- Build mobile-first.
- Do not publish uncertain prices, schedules, or availability as guaranteed.
