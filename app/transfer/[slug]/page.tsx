import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TransferEnquiryWidget } from "@/components/transfer/TransferEnquiryWidget";
import {
  TransferFaqSection,
  TransferFleetSection,
  TransferHeroAside,
  TransferImportantInfoSection,
  TransferInclusionsSection,
  TransferJourneySection,
  TransferScheduleSection,
  TransferTrustSection,
} from "@/components/transfer/TransferPageSections";
import { TransferStickyBar } from "@/components/transfer/TransferStickyBar";
import { getAvailabilityMessage } from "@/lib/transfer";
import { getLiveTransferBySlug } from "@/lib/repositories/liveReads";
import { SITE_NAME, SITE_URL, absoluteUrl, createPageMetadata, jsonLdScript } from "@/lib/seo";

type TransferDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: TransferDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const transferRead = await getLiveTransferBySlug(slug);
  const transfer = transferRead.data;

  if (!transfer) {
    return { title: "Transfer Not Found" };
  }

  return createPageMetadata({
    title: transfer.seo?.title ?? `${transfer.operatorName} Transfer | iThoddoo Maldives`,
    description: transfer.seo?.description ?? transfer.shortDescription,
    path: `/transfer/${transfer.slug}`,
    image: transfer.image,
  });
}

export default async function TransferDetailPage({ params }: TransferDetailPageProps) {
  const { slug } = await params;
  const transferRead = await getLiveTransferBySlug(slug);
  const transfer = transferRead.data;

  if (!transfer) {
    notFound();
  }

  const transferJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: transfer.title,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: "Thoddoo, Maldives",
    description: transfer.description,
    image: transfer.gallery?.map((image) => absoluteUrl(image)) ?? [absoluteUrl(transfer.image)],
    url: `${SITE_URL}/transfer/${transfer.slug}`,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: "35",
      availability: "https://schema.org/LimitedAvailability",
      description: `${transfer.price} ${getAvailabilityMessage(transfer.availability)}`,
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: transfer.route,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Transfers", item: `${SITE_URL}/transfer` },
      { "@type": "ListItem", position: 2, name: transfer.operatorName, item: `${SITE_URL}/transfer/${transfer.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(transferJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbJsonLd) }} />
      <main className="platformPage transferDetailPage">
        <section className="platformHero transferHero transferDetailHero" style={{ backgroundImage: `url('${transfer.image}')` }}>
          <div className="platformHeroInner transferDetailHeroGrid">
            <div className="transferDetailHeroContent">
              <Link href="/transfer" className="transferBackLink">← Back to transfers</Link>
              <p className="eyebrow">Verified airport transfer</p>
              <h1>{transfer.operatorName}</h1>
              <p>{transfer.description}</p>
              <div className="transferListingBadges">
                <span className="platformPill">Daily service</span>
                <span className="platformPill">Verified operator</span>
                <span className="platformPill">Airport transfer</span>
                <span className="platformPill">Local support</span>
              </div>
              <div className="transferCardActions">
                <a href="#transfer-enquiry" className="platformButton">Book transfer</a>
                <a href={`https://wa.me/9609142538?text=${encodeURIComponent(`Hi, I would like to ask about ${transfer.operatorName}. Please confirm the latest schedule and availability.`)}`} className="platformButton transferSecondaryAction" target="_blank" rel="noopener noreferrer">Ask on WhatsApp</a>
              </div>
            </div>
            <TransferHeroAside transfer={transfer} />
          </div>
        </section>

        <section className="platformSection">
          <div className="platformContainer transferOverviewGrid">
            <div className="transferOverviewCard">
              <p className="eyebrow">Transfer overview</p>
              <h2>{transfer.route}</h2>
              <p>{transfer.shortDescription}</p>
            </div>
            <div className="transferOverviewCard">
              <p className="eyebrow">Availability</p>
              <h2>{getAvailabilityMessage(transfer.availability)}</h2>
              <p>{transfer.scheduleNote}</p>
            </div>
          </div>
        </section>

        <TransferScheduleSection transfer={transfer} />
        <TransferFleetSection transfer={transfer} />
        <TransferJourneySection />
        <TransferInclusionsSection transfer={transfer} />
        <TransferImportantInfoSection transfer={transfer} />
        <TransferFaqSection transfer={transfer} />
        <TransferTrustSection transfer={transfer} />

        <section className="platformSection platformSectionMuted" id="transfer-enquiry">
          <div className="platformContainer transferBookingLayout">
            <TransferEnquiryWidget transfer={transfer} />
          </div>
        </section>

        <TransferStickyBar transfer={transfer} />
      </main>
    </>
  );
}
