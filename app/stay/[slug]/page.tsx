import type { Metadata } from "next";
import { Suspense } from "react";
import { StayPropertyDetailClient } from "@/components/property/StayPropertyDetailClient";
import { getPublishedStayPropertyBySlug } from "@/lib/properties/propertyReads";
import {
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  createPageMetadata,
  jsonLdScript,
} from "@/lib/seo";

type GuesthousePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: GuesthousePageProps): Promise<Metadata> {
  const { slug } = await params;
  const propertyRead = await getPublishedStayPropertyBySlug(slug);
  const guesthouse = propertyRead.data;

  if (!guesthouse) {
    return {
      title: "Guesthouse Not Found",
    };
  }

  return createPageMetadata({
    title: `${guesthouse.name} in Thoddoo`,
    description: `${guesthouse.description} View rooms, amenities, location, beach access, and direct WhatsApp booking.`,
    path: `/stay/${guesthouse.slug}`,
    image: guesthouse.heroImage,
  });
}

export default async function GuesthousePage({ params }: GuesthousePageProps) {
  const { slug } = await params;
  const propertyRead = await getPublishedStayPropertyBySlug(slug);
  const guesthouse = propertyRead.data;

  const propertyImages =
    guesthouse && guesthouse.gallery.length > 0 ? guesthouse.gallery : [guesthouse?.heroImage ?? "/images/hero-thoddoo.jpg"];
  const propertyJsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: guesthouse?.name ?? "iThoddoo Maldives Stay",
    url: `${SITE_URL}/stay/${guesthouse?.slug ?? slug}`,
    image: propertyImages.map((image) => absoluteUrl(image)),
    description: guesthouse?.description ?? "Thoddoo Maldives stay preview.",
    telephone: guesthouse ? `+${guesthouse.whatsapp}` : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Thoddoo",
      addressCountry: "MV",
    },
    amenityFeature: (guesthouse?.amenities ?? []).map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity,
      value: true,
    })),
    priceRange: guesthouse?.priceFrom ?? "Price on request",
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(propertyJsonLd) }}
      />
      <Suspense fallback={null}>
        <StayPropertyDetailClient
          initialGuesthouse={guesthouse}
          slug={slug}
          readSource={propertyRead.source}
          error={propertyRead.error}
        />
      </Suspense>
    </>
  );
}
