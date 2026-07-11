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
            partner review. This demo saves your application in this browser and prepares a WhatsApp submission.
          </p>
        </div>
        <aside className="onboardingHeroPanel" aria-label="Onboarding scope">
          <strong>No login. No payments. Browser demo storage only.</strong>
          <span>Review your details, save to the demo queue, then send through WhatsApp.</span>
        </aside>
      </section>

      <div className="pageContent">
        <PartnerOnboardingForm categories={partnerCategories} />
      </div>
    </main>
  );
}
