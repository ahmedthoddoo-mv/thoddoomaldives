"use client";

import Link from "next/link";
import PropertyPage from "@/components/property/PropertyPage";
import type { PropertyReadSource } from "@/lib/properties/propertyReads";
import type { Guesthouse } from "@/types/guesthouse";

type StayPropertyDetailClientProps = {
  slug: string;
  initialGuesthouse?: Guesthouse;
  readSource: PropertyReadSource;
  error?: string;
  turnstileSiteKey?: string;
};

export function StayPropertyDetailClient({ initialGuesthouse, error, turnstileSiteKey = "" }: StayPropertyDetailClientProps) {
  const guesthouse = initialGuesthouse;

  if (!guesthouse) {
    return (
      <main className="platformPage">
        <section
          className="platformHero"
          style={{
            backgroundImage: "url('/images/hero-thoddoo.jpg')",
          }}
        >
          <div className="platformHeroInner">
            <p className="eyebrow">Stay not found</p>
            <h1>Property Not Found</h1>
            <p>This stay is not published or is currently unavailable.</p>
            <div className="platformButtonRow">
              <Link className="platformButton" href="/stay">
                Back to Stays
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
      {error ? (
        <div className="platformContainer platformDetailNotice">
          <div className="platformNotice platformNoticeWarning" role="status">
            {error}
          </div>
        </div>
      ) : null}
      <PropertyPage guesthouse={guesthouse} turnstileSiteKey={turnstileSiteKey} />
    </>
  );
}
