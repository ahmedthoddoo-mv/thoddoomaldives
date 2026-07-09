import { PartnerOnboardingForm } from "@/components/partner/PartnerOnboardingForm";
import { partnerCategories } from "@/data/partners";

export default function PartnerOnboardingPage() {
  return (
    <main className="partnersPage onboardingPage">
      <section className="onboardingHero">
        <div>
          <p className="eyebrow">Partner onboarding</p>
          <h1>Become an iThoddoo Growth Partner</h1>
          <p>
            Submit your guesthouse, transport, activity, dining, retail, wellness, or local tourism business for growth
            partner review. This application prepares your details for WhatsApp submission only.
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
