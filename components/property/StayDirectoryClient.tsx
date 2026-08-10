"use client";

import Link from "next/link";
import { VerifiedBadge } from "@/components/partner/VerifiedBadge";
import { usePublicStayProperties } from "@/lib/properties/propertyStore";
import type { Guesthouse } from "@/types/guesthouse";

type StayDirectoryClientProps = {
  initialGuesthouses: Guesthouse[];
  error?: string;
};

export function StayDirectoryClient({ initialGuesthouses, error }: StayDirectoryClientProps) {
  const storedGuesthouses = usePublicStayProperties();
  const guesthousesBySlug = new Map<string, Guesthouse>();
  const allowBrowserDemoMerge = process.env.NEXT_PUBLIC_DATA_MODE === "mock";

  initialGuesthouses.forEach((guesthouse) => guesthousesBySlug.set(guesthouse.slug, guesthouse));
  if (allowBrowserDemoMerge) {
    storedGuesthouses.forEach((guesthouse) => guesthousesBySlug.set(guesthouse.slug, guesthouse));
  }

  const guesthouses = Array.from(guesthousesBySlug.values());

  return (
    <>
      {error ? (
        <div className="platformNotice platformNoticeWarning" role="status">
          {error}
        </div>
      ) : null}
      <div className="platformGrid platformGridTwo">
        {guesthouses.map((guesthouse) => {
          const cardImage = guesthouse.heroImage || guesthouse.gallery[0] || "/images/hero-thoddoo.jpg";
          return (
            <Link key={guesthouse.id} href={`/stay/${guesthouse.slug}`} className="platformCard block overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 focus-visible:ring-offset-4">
              <div className="platformCardImage" style={{ backgroundImage: `url('${cardImage}')` }} />
              <div className="platformCardBody">
                <div className="platformPillRow">
                  {guesthouse.location ? <span className="platformPill">{guesthouse.location}</span> : null}
                  <span className="platformPill">From {guesthouse.priceFrom}</span>
                </div>

                <h3>{guesthouse.name}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {guesthouse.verificationStatus === "Verified" ? (
                    <VerifiedBadge label="Verified by iThoddoo Maldives" />
                  ) : null}
                  {guesthouse.membershipBadge ? (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                      {guesthouse.membershipBadge}
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 text-slate-600">{guesthouse.tagline}</p>
                <p className="mt-4 font-semibold text-slate-900">View rooms and amenities</p>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
