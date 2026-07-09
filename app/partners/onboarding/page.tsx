import { PartnerOnboardingForm } from "@/components/partner/PartnerOnboardingForm";
import { partnerCategories } from "@/data/partners";

export default function PartnerOnboardingPage() {
  return (
    <main className="partnersPage onboardingPage">
      <section className="onboardingHero">
        <div>
          <p className="eyebrow">Partner onboarding</p>
          <h1>Apply to join iThoddoo Maldives</h1>
          <p>
            Submit your guesthouse, transport, activity, dining, retail, wellness, or local tourism business for partner
            review. This first version prepares the application for WhatsApp submission only.
          </p>
        </div>
        <aside className="onboardingHeroPanel" aria-label="Onboarding scope">
          <strong>No login. No payments. No database.</strong>
          <span>Review your details, then send the application through WhatsApp.</span>
        </aside>
      </section>

      <div className="pageContent">
        <PartnerOnboardingForm categories={partnerCategories} />
      </div>
    </main>
  );
}
