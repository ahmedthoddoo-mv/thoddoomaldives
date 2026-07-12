"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PropertyPage from "@/components/property/PropertyPage";
import type { PropertyReadSource } from "@/lib/properties/propertyReads";
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
  readSource: PropertyReadSource;
  error?: string;
};

export function StayPropertyDetailClient({ slug, initialGuesthouse, readSource, error }: StayPropertyDetailClientProps) {
  const searchParams = useSearchParams();
  const publicProperties = usePublicStayProperties();
  const adminProperties = useAdminProperties();
  const previewMode = searchParams.get("preview") === "admin";
  const allowBrowserDemoRead = readSource !== "supabase";
  const previewProperty = previewMode
    ? adminProperties.find((property) => property.slug === slug || property.id === slug)
    : undefined;
  const guesthouse =
    (previewProperty ? adminPropertyToGuesthouse(previewProperty) : undefined) ??
    (allowBrowserDemoRead ? publicProperties.find((property) => property.slug === slug) : undefined) ??
    (allowBrowserDemoRead ? getPublicStayPropertyBySlug(slug) : undefined) ??
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

  return (
    <>
      {error ? (
        <div className="platformContainer platformDetailNotice">
          <div className="platformNotice platformNoticeWarning" role="status">
            {error}
          </div>
        </div>
      ) : null}
      <PropertyPage guesthouse={guesthouse} />
    </>
  );
}
