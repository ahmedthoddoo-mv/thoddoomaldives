# Project Atlas Roadmap

## EPIC-017 — Booking & Inquiry Engine Foundation

Status: IN PROGRESS

Completed foundation work:
- Guest booking widget with property, dates, guests, room type, optional services, and special requests.
- Live booking summary with nights, accommodation estimate, optional services, subtotal, total, and commission split.
- WhatsApp booking message generation for Book via WhatsApp, Send Inquiry, and Request Quote flows.
- Demo Save Draft action surface.
- Reusable booking components for calendar, guest form, room selector, transfer selector, experience selector, summary, price calculator, booking card, status badge, commission card, and availability card.
- Admin Booking Management route with New, Pending, Confirmed, Cancelled, and Completed sections represented in the UI.
- Demo Partner Property Dashboard route with inquiry, booking, arrival, departure, revenue, occupancy, source, popular room, and average stay metrics.
- Future database-ready TypeScript booking models and mock booking data.

Remaining for future epics:
- Persist bookings to Supabase/PostgreSQL.
- Add partner authentication and role-based access.
- Connect real availability, seasonal pricing, and inventory holds.
- Add payment/deposit workflows when payments become in scope.
- Add notifications, CRM pipelines, and analytics events.
