# iThoddoo Maldives Partner Program

## Mission

The Partner Platform is the commercial foundation for Project Atlas. It is designed to become the operating system for local island tourism in Thoddoo: a structured network of verified businesses, services, media, traveler intent, leads, insights, and future booking capabilities.

This epic intentionally does not build authentication, payments, booking, admin dashboards, CRM, or email. It prepares the business architecture those systems will depend on.

## Business Philosophy

iThoddoo Maldives should not behave like a simple directory or tourism blog. The platform should help local businesses grow by improving trust, content quality, discoverability, service structure, and decision-making.

The core principle is that every partner relationship should increase the quality of the destination experience. Growth should be earned through reliable service, strong content, verified information, and measurable traveler demand.

## Why We Do Not Sell Advertising

Advertising sells attention without guaranteeing business value. A static banner can create impressions, but it does not necessarily help a traveler choose the right guesthouse, boat, dive center, restaurant, guide, or service.

iThoddoo Maldives should avoid becoming a marketplace of paid noise. If every business can simply buy visibility without trust, category fit, or service quality, traveler confidence declines and the destination brand weakens.

## Why We Sell Growth

The partner program sells a growth system:

- Structured partner profiles
- Verified badges and review workflow
- Better media and professional photography
- Featured search and homepage rotation
- Trip Planner integration
- WhatsApp lead intent
- AI Concierge priority for Premium partners
- Seasonal promotions and campaigns
- Monthly insights and future advanced analytics
- Future booking tools

This creates recurring value because the partner receives better positioning, clearer demand signals, and a path toward measurable conversion.

## Revenue Model

The architecture supports three membership levels:

- Free: basic listing, contact details, five photos, and basic information.
- Verified: trust badge, premium profile, featured search, more photos, WhatsApp integration, homepage rotation, Trip Planner integration, and monthly insights.
- Premium: everything in Verified plus professional photography, video, AI Concierge priority, featured campaigns, homepage hero rotation, advanced analytics, seasonal promotions, and future booking tools.

Future revenue extensions can include campaign packages, booking commissions, content production, seasonal promotion bundles, and partner intelligence products. These should be introduced only when measurement and partner value are strong enough to justify them.

## Partner Journey

1. Business registration
2. Upload photos
3. Add rooms or services
4. Verification review
5. Verified Partner
6. Monthly growth dashboard

The current implementation models this journey as data, not as a full workflow engine. Later epics can attach authentication, partner accounts, file uploads, admin review tools, and analytics dashboards.

## Future Roadmap

Recommended roadmap sequence:

1. Authentication and partner accounts
2. Partner onboarding forms
3. Media upload and moderation
4. Admin verification dashboard
5. Public partner profiles and category search
6. Lead capture and WhatsApp attribution
7. Trip Planner service integration
8. Monthly growth dashboard
9. CRM and email notifications
10. Booking engine and payment gateway
11. Campaign management
12. Advanced analytics and revenue attribution

## Architectural Notes

Partner categories are represented as typed definitions so new categories can be added without rewriting membership or onboarding logic. Membership plans are entitlement-driven, which allows UI, search ranking, future dashboards, and campaign placement to check capabilities from one source of truth.

Leads and analytics are modeled separately from partners because they will eventually have different lifecycles, storage needs, permissions, and reporting surfaces. This keeps the current foundation clean while leaving room for future operational systems.
