"use client";

import Link from "next/link";
import { usePublicStayProperties } from "@/lib/properties/propertyStore";
import type { Guesthouse } from "@/types/guesthouse";

type StayDirectoryClientProps = {
  initialGuesthouses: Guesthouse[];
};

export function StayDirectoryClient({ initialGuesthouses }: StayDirectoryClientProps) {
  const storedGuesthouses = usePublicStayProperties();
  const guesthousesBySlug = new Map<string, Guesthouse>();

  initialGuesthouses.forEach((guesthouse) => guesthousesBySlug.set(guesthouse.slug, guesthouse));
  storedGuesthouses.forEach((guesthouse) => guesthousesBySlug.set(guesthouse.slug, guesthouse));

  const guesthouses = Array.from(guesthousesBySlug.values());

  return (
    <div className="platformGrid platformGridTwo">
      {guesthouses.map((guesthouse) => (
        <Link key={guesthouse.id} href={`/stay/${guesthouse.slug}`} className="platformCard">
          <div
            className="platformCardImage"
            style={{ backgroundImage: `url('${guesthouse.heroImage}')` }}
          />
          <div className="platformCardBody">
            <div className="platformPillRow">
              <span className="platformPill">{guesthouse.distanceToBeach}</span>
              <span className="platformPill">Rating {guesthouse.rating}</span>
            </div>

            <h3>{guesthouse.name}</h3>
            <p>{guesthouse.tagline}</p>
            <p className="font-semibold text-slate-900">View rooms and amenities</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
