import { PartnerOnboardingForm } from "@/components/partner/PartnerOnboardingForm";

export default function PartnerOnboardingPage() {
  return (
    <main className="partnersPage onboardingPage">
      <section className="onboardingHero">
        <div>
          <p className="eyebrow">Partner onboarding</p>
          <h1>Become an iThoddoo Growth Partner</h1>
          <p>
            Submit your guesthouse, transport, activity, dining, retail, wellness, or local tourism business for growth
            partner review. The application is saved first, then you can continue to WhatsApp with your reference.
          </p>
        </div>
        <aside className="onboardingHeroPanel" aria-label="Onboarding scope">
          <strong>No login. No payments. Supabase-backed review queue.</strong>
          <span>Dynamic questions, pricing rows, media metadata, and WhatsApp confirmation.</span>
        </aside>
      </section>

      <div className="pageContent">
        <PartnerOnboardingForm />
      </div>
    </main>
  );
}
