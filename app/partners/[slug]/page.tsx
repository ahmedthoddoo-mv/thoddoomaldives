import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPartnerProfilePage } from "@/components/partner/PublicPartnerProfilePage";
import { getPublicPartnerProfileBySlug } from "@/lib/partners/publicProfiles";
import { createPageMetadata } from "@/lib/seo";

type PartnerProfilePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: PartnerProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const profileRead = await getPublicPartnerProfileBySlug(slug);
  const profile = profileRead.data;

  if (!profile) {
    return createPageMetadata({
      title: "Partner Profile",
      description: "Approved partner profiles on iThoddoo Maldives.",
      path: `/partners/${slug}`,
    });
  }

  return createPageMetadata({
    title: `${profile.name} | iThoddoo Maldives`,
    description: profile.shortDescription,
    path: `/partners/${profile.slug}`,
    image: profile.heroImage,
  });
}

export default async function PartnerProfilePage({ params }: PartnerProfilePageProps) {
  const { slug } = await params;
  const profileRead = await getPublicPartnerProfileBySlug(slug);
  const profile = profileRead.data;

  if (!profile) {
    notFound();
  }

  return <PublicPartnerProfilePage profile={profile} relatedListing={profileRead.relatedListing} />;
}
