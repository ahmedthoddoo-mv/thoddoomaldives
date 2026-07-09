import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PropertyPage from "@/components/property/PropertyPage";
import { getGuesthouseBySlug, guesthouses } from "@/data/guesthouses";
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
  return guesthouses.map((guesthouse) => ({
    slug: guesthouse.slug,
  }));
}

export async function generateMetadata({
  params,
}: GuesthousePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guesthouse = getGuesthouseBySlug(slug);

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
  const guesthouse = getGuesthouseBySlug(slug);

  if (!guesthouse) {
    notFound();
  }

  const propertyImages =
    guesthouse.gallery.length > 0 ? guesthouse.gallery : [guesthouse.heroImage];
  const propertyJsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: guesthouse.name,
    url: `${SITE_URL}/stay/${guesthouse.slug}`,
    image: propertyImages.map((image) => absoluteUrl(image)),
    description: guesthouse.description,
    telephone: `+${guesthouse.whatsapp}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Thoddoo",
      addressCountry: "MV",
    },
    amenityFeature: guesthouse.amenities.map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity,
      value: true,
    })),
    priceRange: guesthouse.priceFrom,
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
      <PropertyPage guesthouse={guesthouse} />
    </>
  );
}
