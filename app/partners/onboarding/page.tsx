import { PartnerOnboardingForm } from "@/components/partner/PartnerOnboardingForm";

export const dynamic = "force-dynamic";

export default function PartnerOnboardingPage() {
  return (
    <main className="partnersPage onboardingPage">
      <section className="onboardingHero">
        <div>
          <p className="eyebrow">Partner onboarding</p>
          <h1>Join the iThoddoo Maldives Partner Network</h1>
          <p>
            Submit your guesthouse, transport, activity, dining, retail, wellness, or local tourism business for growth
            partner review. The application is saved first, then you can continue to WhatsApp with your reference.
          </p>
        </div>
        <aside className="onboardingHeroPanel" aria-label="Onboarding scope">
          <strong>Secure application and verification workflow.</strong>
          <span>Submit structured business details for review, then manage your approved listing through the partner portal.</span>
        </aside>
      </section>

      <div className="pageContent">
        <PartnerOnboardingForm turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""} />
      </div>
    </main>
  );
}
