# iThoddoo Maldives Tasks

## TASK-001 — Dynamic Property Platform

Status: Completed locally

Objective: Convert the existing hardcoded guesthouse system into a scalable dynamic property platform.

Completed:
- Built reusable `PropertyPage` component receiving `guesthouse: Guesthouse`.
- Connected `/stay/[slug]` to `data/guesthouses.ts`.
- Added `generateStaticParams()` for static property pages.
- Added dynamic metadata for property pages.
- Added 404 handling for unknown guesthouse slugs.
- Updated `/stay` to list properties from shared guesthouse data.
- Removed the hardcoded `/stay/thoddoo-sun-sky-inn` page so the dynamic route is the source of truth.
- Verified with `npm run lint`.
- Verified with `npm run build`.

Files changed:
- `components/property/PropertyPage.tsx`
- `app/stay/[slug]/page.tsx`
- `app/stay/page.tsx`
- `app/stay/thoddoo-sun-sky-inn/page.tsx`

Notes:
- Current guesthouse image paths reference files such as `/images/stay/guesthouse-front.jpg` and `/images/rooms/deluxe-1.jpg`.
- Those images should be added to `public/images` for the property visuals to show fully.

## Next Tasks

### TASK-002 — Add Property Images

Status: Pending

Add the missing stay and room images to:
- `public/images/stay/`
- `public/images/rooms/`

### TASK-003 — Add More Guesthouses

Status: Pending

Add additional guesthouse entries to `data/guesthouses.ts`. Each new guesthouse should include:
- `id`
- `slug`
- `name`
- `tagline`
- `description`
- `location`
- `distanceToBeach`
- `rating`
- `whatsapp`
- `heroImage`
- `gallery`
- `amenities`
- `rooms`

### TASK-004 — Publish Property Platform

Status: Pending

After review, commit and push the dynamic property platform changes to `main`.
