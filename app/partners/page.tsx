import { MembershipComparison } from "@/components/partner/MembershipComparison";
import { GrowthPartnerBanner } from "@/components/partner/GrowthPartnerBanner";
import { PartnerBenefits } from "@/components/partner/PartnerBenefits";
import { PartnerCard } from "@/components/partner/PartnerCard";
import { PartnerCTA } from "@/components/partner/PartnerCTA";
import { PartnerHero } from "@/components/partner/PartnerHero";
import { PartnerPlanCard } from "@/components/partner/PartnerPlanCard";
import { PartnerStats } from "@/components/partner/PartnerStats";
import { membershipFeatures, membershipPlans, partnerOnboardingSteps } from "@/data/membershipPlans";
import { partnerCategories, partners } from "@/data/partners";

const stats = [
  {
    value: "13",
    label: "Business types",
    description: "One partner model supports stays, transfers, activities, dining, retail, wellness, and local services."
  },
  {
    value: "3",
    label: "Growth tiers",
    description: "Free, Verified, and Premium plans share reusable entitlement logic."
  },
  {
    value: "6",
    label: "Onboarding stages",
    description: "The journey is ready for future accounts, reviews, dashboards, and analytics."
  }
];

const faqs = [
  {
    question: "Who should join?",
    answer:
      "Guesthouses, hotels, transport operators, dive centers, watersports teams, restaurants, cafes, photographers, taxis, shops, spas, and tour guides that serve Thoddoo travelers."
  },
  {
    question: "Is this an advertising product?",
    answer:
      "No. The program sells growth infrastructure: trusted profiles, better content, traveler intent, placement systems, and future analytics."
  },
  {
    question: "How does iThoddoo Maldives generate bookings?",
    answer:
      "The platform connects discovery, search, trip planning, WhatsApp intent, concierge recommendations, campaigns, and future booking tools into one partner graph."
  },
  {
    question: "What comes later?",
    answer:
      "Authentication, payment gateway, booking engine, admin dashboard, CRM, and email systems are intentionally deferred to later epics."
  },
  {
    question: "Why professional photography?",
    answer:
      "High-quality media improves trust, conversion, campaign performance, and traveler confidence across accommodation, activity, food, and service categories."
  },
  {
    question: "What will analytics include?",
    answer:
      "Future analytics can track profile views, lead clicks, WhatsApp intent, Trip Planner adds, homepage impressions, campaigns, and conversion."
  }
];

export default function PartnersPage() {
  return (
    <main className="partnersPage">
      <PartnerHero partnerCount={partners.length} categoryCount={partnerCategories.length} />
      <div className="pageContent">
        <PartnerStats stats={stats} />

        <section className="section">
          <div className="sectionHeader">
            <p className="eyebrow">Who should join</p>
            <h2>Every serious local tourism business should have a place in the system</h2>
            <p>
              The platform is category-first, so new business types can be added by extending typed category definitions
              instead of rebuilding pages, plans, or onboarding flows.
            </p>
          </div>
          <div className="categoryGrid">
            {partnerCategories.map((category) => (
              <article className="featureBlock" key={category.id}>
                <h3>{category.pluralLabel}</h3>
                <p>{category.description}</p>
              </article>
            ))}
          </div>
        </section>

        <PartnerBenefits />

        <section className="section" id="plans">
          <div className="sectionHeader">
            <p className="eyebrow">Plans</p>
            <h2>Membership that maps to real partner outcomes</h2>
          </div>
          <div className="planGrid">
            {membershipPlans.map((plan) => (
              <PartnerPlanCard key={plan.tier} plan={plan} />
            ))}
          </div>
        </section>

        <MembershipComparison plans={membershipPlans} features={membershipFeatures} />

        <GrowthPartnerBanner />

        <section className="section">
          <div className="sectionHeader">
            <p className="eyebrow">How bookings grow</p>
            <h2>From content quality to traveler intent</h2>
            <p>
              The first release prepares structured supply. Later releases can add demand capture through search,
              itinerary planning, AI Concierge recommendations, booking tools, and partner analytics.
            </p>
          </div>
          <div className="benefitGrid">
            <article className="featureBlock">
              <h3>Search visibility</h3>
              <p>Verified and Premium partners can be surfaced where travelers compare options and make decisions.</p>
            </article>
            <article className="featureBlock">
              <h3>Trip Planner intent</h3>
              <p>Eligible services can become planning objects, which prepares the path to future lead and booking flows.</p>
            </article>
            <article className="featureBlock">
              <h3>Concierge routing</h3>
              <p>Premium partners are modeled for AI Concierge priority when traveler requests match their category.</p>
            </article>
          </div>
        </section>

        <section className="section">
          <div className="sectionHeader">
            <p className="eyebrow">Future analytics</p>
            <h2>Monthly insight loops for better partner decisions</h2>
            <p>
              Analytics are represented as typed capabilities now, without building dashboards. That keeps the foundation
              ready for profile views, lead quality, WhatsApp clicks, campaign results, and conversion reporting.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="sectionHeader">
            <p className="eyebrow">Professional photography</p>
            <h2>Better media is a growth lever</h2>
            <p>
              Premium includes a media layer because traveler confidence depends on the quality of rooms, boats, food,
              activities, and service presentation. The architecture keeps media entitlements plan-aware.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="sectionHeader">
            <p className="eyebrow">Partner onboarding</p>
            <h2>A six-step journey ready for later product systems</h2>
          </div>
          <div className="timeline">
            {partnerOnboardingSteps.map((step) => (
              <article className="timelineStep" key={step.id}>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="sectionHeader">
            <p className="eyebrow">Sample partner profiles</p>
            <h2>Typed examples for future listings, dashboards, and lead flows</h2>
          </div>
          <div className="partnerGrid">
            {partners.map((partner) => (
              <PartnerCard
                key={partner.id}
                partner={partner}
                category={partnerCategories.find((category) => category.id === partner.category)}
              />
            ))}
          </div>
        </section>

        <section className="section" id="faq">
          <div className="sectionHeader">
            <p className="eyebrow">FAQ</p>
            <h2>Partner program questions</h2>
          </div>
          <div className="faqGrid">
            {faqs.map((faq) => (
              <article className="faqItem" key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <PartnerCTA />
      </div>
    </main>
  );
}
