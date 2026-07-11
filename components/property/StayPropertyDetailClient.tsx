"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PropertyPage from "@/components/property/PropertyPage";
import {
  adminPropertyToGuesthouse,
  getPublicStayPropertyBySlug,
  useAdminProperties,
  usePublicStayProperties
} from "@/lib/properties/propertyStore";
import type { Guesthouse } from "@/types/guesthouse";

type StayPropertyDetailClientProps = {
  slug: string;
  initialGuesthouse?: Guesthouse;
};

export function StayPropertyDetailClient({ slug, initialGuesthouse }: StayPropertyDetailClientProps) {
  const searchParams = useSearchParams();
  const publicProperties = usePublicStayProperties();
  const adminProperties = useAdminProperties();
  const previewMode = searchParams.get("preview") === "admin";
  const previewProperty = previewMode
    ? adminProperties.find((property) => property.slug === slug || property.id === slug)
    : undefined;
  const guesthouse =
    (previewProperty ? adminPropertyToGuesthouse(previewProperty) : undefined) ??
    publicProperties.find((property) => property.slug === slug) ??
    getPublicStayPropertyBySlug(slug) ??
    initialGuesthouse;

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
            <p>This stay is not published or does not exist in the current demo browser storage.</p>
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

  return <PropertyPage guesthouse={guesthouse} />;
}
