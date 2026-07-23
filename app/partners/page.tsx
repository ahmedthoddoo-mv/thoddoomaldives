import Link from "next/link";
import { membershipFeatures, membershipPlans, partnerOnboardingSteps } from "@/data/membershipPlans";

const successStats = [
  { value: "13", label: "Partner categories", detail: "Built for every serious Thoddoo tourism operator." },
  { value: "3", label: "Growth tiers", detail: "Free, Verified, and Premium paths from day one." },
  { value: "24h", label: "Review target", detail: "Demo operating goal for partner application follow-up." },
  { value: "1", label: "Local platform", detail: "Discovery, trust, media, and WhatsApp intent in one place." }
];

const partnerCategories = [
  "Guesthouses",
  "Hotels",
  "Speedboat Companies",
  "Ferry Operators",
  "Dive Centers",
  "Watersports",
  "Restaurants",
  "Cafés",
  "Shops",
  "Wellness",
  "Photography",
  "Agriculture Experiences",
  "Local Guides"
];

const whyJoin = [
  {
    icon: "01",
    title: "Turn visibility into qualified demand",
    text: "Move beyond a basic listing with profile structure, search placement, trip-planner readiness, and WhatsApp intent."
  },
  {
    icon: "02",
    title: "Build trust before the traveler messages",
    text: "Verification, better media, service details, and local context help travelers choose with confidence."
  },
  {
    icon: "03",
    title: "Prepare for future booking infrastructure",
    text: "The partner model is ready for dashboards, analytics, booking tools, campaigns, and AI concierge routing."
  }
];

const faqs = [
  {
    question: "Is there a setup fee?",
    answer: "No. This demo partner program keeps onboarding simple and does not include setup fees, payments, or backend billing."
  },
  {
    question: "Can I keep my existing booking channels?",
    answer: "Yes. The current flow is WhatsApp-first and does not replace your existing direct channels."
  },
  {
    question: "What is the difference between Free, Verified, and Premium?",
    answer: "Free gives basic discoverability, Verified adds trust and growth visibility, and Premium is for partners who want priority media, campaigns, and future analytics."
  },
  {
    question: "How do I apply?",
    answer: "Use the Apply Now button to open the partner onboarding form. The current version prepares a WhatsApp submission only."
  }
];

function formatCapability(included: boolean) {
  return included ? "Included" : "Not included";
}

export default function PartnersPage() {
  return (
    <main className="partnerLanding">
      <section className="partnerLandingHero">
        <div className="partnerHeroContent">
          <p className="eyebrow">iThoddoo Growth Partner Program</p>
          <h1>Grow Your Business with iThoddoo Maldives</h1>
          <p>
            A premium partner platform for Thoddoo operators who want stronger visibility, trusted profiles, better
            media, and a cleaner path from traveler discovery to WhatsApp intent.
          </p>
          <div className="partnerHeroActions">
            <Link className="partnerPrimaryButton" href="/partners/onboarding">
              Apply Now
            </Link>
            <a className="partnerGhostButton" href="#plans">
              View partner plans
            </a>
          </div>
        </div>

        <aside className="partnerHeroGlass" aria-label="Partner program summary">
          <span>Live demo</span>
          <strong>Growth Partner OS</strong>
          <p>Free discovery, verified trust, premium campaigns, and future analytics-ready partner infrastructure.</p>
          <div className="partnerMiniMetrics">
            <div>
              <strong>3</strong>
              <span>plans</span>
            </div>
            <div>
              <strong>13</strong>
              <span>categories</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="partnerLandingSection partnerStatsSection">
        <div className="partnerLandingContainer partnerStatsGrid">
          {successStats.map((stat) => (
            <article className="partnerGlassCard partnerStatCard" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
              <p>{stat.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="partnerLandingSection" id="plans">
        <div className="partnerLandingContainer">
          <div className="partnerSectionHeader">
            <p className="eyebrow">Pricing cards</p>
            <h2>Choose the right growth path</h2>
            <p>Start simple, earn traveler trust, or compete with richer media and priority destination visibility.</p>
          </div>

          <div className="partnerPlanGrid">
            {membershipPlans.map((plan) => (
              <article className={`partnerPlanCard ${plan.isRecommended ? "partnerPlanFeatured" : ""}`} key={plan.tier}>
                {plan.isRecommended ? <span className="partnerPlanBadge">Recommended</span> : null}
                <p className="eyebrow">{plan.tagline}</p>
                <h3>{plan.name} Partner</h3>
                <p>{plan.description}</p>
                <strong>{plan.billingCadence === "free" ? "Free" : "Growth plan"}</strong>
                <ul>
                  {plan.benefits.slice(0, 5).map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="partnerLandingSection partnerDarkBand">
        <div className="partnerLandingContainer">
          <div className="partnerSectionHeader">
            <p className="eyebrow">Why join us</p>
            <h2>Designed for serious local tourism businesses</h2>
          </div>
          <div className="partnerWhyGrid">
            {whyJoin.map((item) => (
              <article className="partnerGlassCard" key={item.title}>
                <span className="partnerIcon">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="partnerLandingSection">
        <div className="partnerLandingContainer">
          <div className="partnerSectionHeader">
            <p className="eyebrow">Benefits comparison</p>
            <h2>What each partner tier unlocks</h2>
          </div>

          <div className="partnerComparison" role="table" aria-label="Partner benefits comparison">
            <div className="partnerComparisonRow partnerComparisonHead" role="row">
              <span role="columnheader">Capability</span>
              {membershipPlans.map((plan) => (
                <span key={plan.tier} role="columnheader">
                  {plan.name}
                </span>
              ))}
            </div>
            {membershipFeatures.map((feature) => (
              <div className="partnerComparisonRow" role="row" key={feature.id}>
                <span role="cell">
                  <strong>{feature.label}</strong>
                  <small>{feature.description}</small>
                </span>
                {membershipPlans.map((plan) => (
                  <span key={plan.tier} role="cell">
                    {formatCapability(feature.includedIn.includes(plan.tier))}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="partnerLandingSection partnerCategoriesSection">
        <div className="partnerLandingContainer">
          <div className="partnerSectionHeader">
            <p className="eyebrow">Partner categories</p>
            <h2>Built for the full island economy</h2>
          </div>
          <div className="partnerCategoryCloud">
            {partnerCategories.map((category) => (
              <span key={category}>{category}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="partnerLandingSection">
        <div className="partnerLandingContainer">
          <div className="partnerSectionHeader">
            <p className="eyebrow">How onboarding works</p>
            <h2>From application to growth-ready profile</h2>
          </div>
          <div className="partnerProcessGrid">
            {partnerOnboardingSteps.map((step) => (
              <article className="partnerProcessCard" key={step.id}>
                <span>{String(step.stepNumber).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="partnerLandingSection">
        <div className="partnerLandingContainer">
          <div className="partnerSectionHeader">
            <p className="eyebrow">FAQ</p>
            <h2>Partner program questions</h2>
          </div>
          <div className="partnerFaqGrid">
            {faqs.map((faq) => (
              <article className="partnerGlassCard" key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="partnerFinalCta">
        <div className="partnerLandingContainer">
          <p className="eyebrow">Apply today</p>
          <h2>Ready to become an iThoddoo Growth Partner?</h2>
          <p>Submit your business details through the WhatsApp-only onboarding flow. No login, database, or payments.</p>
          <Link className="partnerPrimaryButton" href="/partners/onboarding">
            Apply Now
          </Link>
        </div>
      </section>
    </main>
  );
}
