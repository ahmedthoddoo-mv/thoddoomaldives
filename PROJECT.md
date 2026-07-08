# iThoddoo Maldives Project

## Vision

iThoddoo Maldives is a modern local travel platform for Thoddoo Island, Maldives. The long-term vision is to become the trusted digital gateway for travelers who want to discover, plan, and book authentic local island experiences.

## Mission

Help visitors plan better Thoddoo trips by combining local knowledge, clear information, easy WhatsApp booking, and a growing catalog of stays, transfers, excursions, restaurants, guides, and island services.

## Goals

- Make it easy for guests to discover Thoddoo before arrival.
- Convert visitor interest into WhatsApp inquiries and bookings.
- Build a scalable property and experience platform driven by structured data.
- Keep the site fast, mobile-first, and simple to maintain.
- Prepare the foundation for an Admin Dashboard and AI Concierge.
- Support future expansion to nearby islands and multilingual audiences.

## Target Users

- International travelers planning a Maldives local island holiday.
- Guests already staying in Thoddoo who need excursions, transfers, restaurants, or guides.
- Couples, families, solo travelers, divers, and budget-conscious visitors.
- Local guesthouses and operators who need a digital booking and discovery channel.
- Future platform admins managing properties, excursions, leads, and content.

## Business Model

- Commission or referral fees from guesthouse bookings.
- Commission or margin on excursions and transfer bookings.
- Featured placement for properties, restaurants, shops, and local services.
- Future paid partner dashboard for operators.
- Future AI Concierge upsells for personalized travel planning.
- Future online payment handling and booking deposits.

## Tech Stack

- Framework: Next.js 16 with App Router.
- Language: TypeScript.
- UI: React 19 and TailwindCSS.
- Styling: Tailwind utility classes with shared UI components.
- Data: Local TypeScript data modules today, API or database later.
- Routing: File-based App Router routes in `app/`.
- Booking: WhatsApp links generated through `lib/whatsapp.ts`.
- Deployment: GitHub-connected hosting for `thoddoomaldives.com`.

## Folder Structure

```text
app/
  about/
  contact/
  excursions/
  experiences/
  gallery/
  guide/
  restaurants/
  stay/
    [slug]/
    page.tsx
  transfer/
  layout.tsx
  page.tsx
  globals.css

components/
  property/
    PropertyAmenities.tsx
    PropertyPage.tsx
    PropertyRoomCard.tsx
  ui/
    Badge.tsx
    Button.tsx
    Card.tsx
    Container.tsx
    SectionTitle.tsx
  BookButton.tsx
  BookingInquiryForm.tsx
  ExcursionInquiryForm.tsx
  ExperienceCard.tsx
  Footer.tsx
  HeroSlider.tsx
  Navbar.tsx
  WhatsAppButton.tsx

data/
  guesthouses.ts

lib/
  experiences.ts
  whatsapp.ts

types/
  guesthouse.ts

public/
  images/
```

## Product Direction

The project should move from hardcoded pages toward structured platform data. The preferred pattern is:

1. Define a type in `types/`.
2. Store current content in `data/`.
3. Render through reusable components in `components/`.
4. Route through App Router pages in `app/`.
5. Replace local data with API/database sources when the Admin Dashboard is introduced.
