# SEO & Performance Foundation

## Metadata Strategy

The site uses the Next.js App Router metadata API.

- `app/layout.tsx` defines the global metadata defaults, title template, canonical base URL, Open Graph defaults, and Twitter card defaults.
- `lib/seo.ts` centralizes the site URL, brand name, default share image, canonical URL creation, page metadata creation, and JSON-LD serialization.
- Individual pages define route-specific titles, descriptions, canonical URLs, Open Graph metadata, and Twitter metadata.
- Dynamic property pages generate metadata from `data/guesthouses.ts` so new properties inherit SEO fields from shared data.

## Sitemap

`app/sitemap.ts` generates `/sitemap.xml` using the App Router sitemap convention.

It includes static marketing routes, the experiences compatibility route, the live excursions route, and guesthouse detail pages generated from `data/guesthouses.ts`.

## Robots

`app/robots.ts` generates `/robots.txt` using the App Router robots convention.

The current policy allows indexing for all crawlers and points crawlers to the generated sitemap.

## Structured Data

Structured data is intentionally simple:

- Homepage: `WebSite`
- Property pages: `LodgingBusiness`
- Guide page: `TouristInformationCenter`

JSON-LD is rendered with native `<script type="application/ld+json">` tags and serialized through `lib/seo.ts`.

## Image Optimization Plan

Most major page images currently use CSS `background-image` because they are part of existing hero/card layouts. These were not broadly refactored to avoid redesigning pages.

The gallery grid now uses `next/image` because it is a safe, contained optimization with stable dimensions.

Next steps:

- Add real property, room, restaurant, transfer, and excursion photos.
- Move repeated card images from CSS backgrounds to `next/image` where layout impact is low.
- Add descriptive image metadata to data files when final assets are available.
- Consider local fonts or checked-in font assets if Google Fonts network fetches become a deployment concern.
