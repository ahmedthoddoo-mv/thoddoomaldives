import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PropertyPage from "@/components/property/PropertyPage";
import { getGuesthouseBySlug, guesthouses } from "@/data/guesthouses";

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
      title: "Guesthouse Not Found | iThoddoo Maldives",
    };
  }

  return {
    metadataBase: new URL("https://thoddoomaldives.com"),
    title: `${guesthouse.name} | Stay in Thoddoo`,
    description: guesthouse.description,
    openGraph: {
      title: `${guesthouse.name} | iThoddoo Maldives`,
      description: guesthouse.description,
      images: [guesthouse.heroImage],
    },
  };
}

export default async function GuesthousePage({ params }: GuesthousePageProps) {
  const { slug } = await params;
  const guesthouse = getGuesthouseBySlug(slug);

  if (!guesthouse) {
    notFound();
  }

  return <PropertyPage guesthouse={guesthouse} />;
}
