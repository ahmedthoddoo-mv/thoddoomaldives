import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking Request Failed"
};

export default function BookingFailurePage() {
  return (
    <main className="platformPage">
      <section className="platformHero" style={{ backgroundImage: "url('/images/hero-thoddoo.jpg')" }}>
        <div className="platformHeroInner">
          <p className="eyebrow">Booking request not saved</p>
          <h1>Please check the details and try again</h1>
          <p>
            No payment was collected. You can return to the property page, adjust the request, or contact the iThoddoo Maldives team directly.
          </p>
          <div className="platformButtonRow">
            <Link className="platformButton" href="/stay">
              Back to stays
            </Link>
            <Link className="platformButton platformButtonSecondary" href="/contact">
              Contact support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
