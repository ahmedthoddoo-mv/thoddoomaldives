import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getLivePublishedTransfers } from "@/lib/repositories/liveReads";
import { createPageMetadata } from "@/lib/seo";
import { generateTransferEnquiryLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

type TransferSlugPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: TransferSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const transferRead = await getLivePublishedTransfers();
  const transfer = transferRead.data.find((t) => t.slug === slug);

  if (!transfer) {
    return { title: "Transfer Not Found" };
  }

  return createPageMetadata({
    title: `${transfer.title} – Thoddoo Transfer | USD 35 per person`,
    description: `${transfer.description} Approximately ${transfer.duration}. Book via WhatsApp with iThoddoo Maldives.`,
    path: `/transfer/${transfer.slug}`,
    image: transfer.image,
  });
}

export default async function TransferSlugPage({ params }: TransferSlugPageProps) {
  const { slug } = await params;
  const transferRead = await getLivePublishedTransfers();
  const transfer = transferRead.data.find((t) => t.slug === slug);

  if (!transfer) {
    notFound();
  }

  const waLink = generateTransferEnquiryLink({});

  return (
    <main className="platformPage">
      {/* ── Hero ── */}
      <section
        className="platformHero transferHero"
        style={{ backgroundImage: `url('${transfer.image}')` }}
      >
        <div className="platformHeroInner">
          <p className="eyebrow">
            <Link href="/transfer" className="transferBreadcrumb">
              Transfers
            </Link>{" "}
            / {transfer.type}
          </p>
          <h1>{transfer.title}</h1>
          <p>{transfer.description}</p>
          <div className="platformButtonRow">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="platformButton"
              aria-label={`Enquire about ${transfer.title} via WhatsApp`}
            >
              💬 Enquire via WhatsApp
            </a>
            <Link href="/transfer" className="platformButtonSecondary">
              All Transfer Options
            </Link>
          </div>
        </div>
      </section>

      {/* ── Detail band ── */}
      <section className="transferEnquiryBand" aria-label="Transfer details">
        <div className="platformContainer transferEnquiryRow">
          <div className="transferEnquiryStat">
            <span className="transferEnquiryStatValue">{transfer.price}</span>
            <span className="transferEnquiryStatLabel">price</span>
          </div>
          <div className="transferEnquiryStat">
            <span className="transferEnquiryStatValue">{transfer.duration}</span>
            <span className="transferEnquiryStatLabel">journey time</span>
          </div>
          <div className="transferEnquiryStat">
            <span className="transferEnquiryStatValue">{transfer.departurePoint}</span>
            <span className="transferEnquiryStatLabel">departure</span>
          </div>
          <div className="transferEnquiryCta">
            <p className="transferEnquiryNote">Availability confirmed after enquiry</p>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="platformButton"
            >
              Check Availability
            </a>
          </div>
        </div>
      </section>

      {/* ── Highlights ── */}
      <section className="platformSection">
        <div className="platformContainer">
          <div className="platformSectionHeader">
            <p className="eyebrow">What&rsquo;s included</p>
            <h2>Transfer Highlights</h2>
            {transfer.scheduleNote && (
              <p>{transfer.scheduleNote}</p>
            )}
          </div>
          <ul className="transferHighlightGrid">
            {transfer.highlights.map((detail) => (
              <li key={detail} className="transferHighlightGridItem">
                <span className="transferHighlightCheck" aria-hidden="true">✓</span>
                {detail}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Travel notice ── */}
      <section className="platformSection platformSectionMuted">
        <div className="platformContainer">
          <div className="platformSectionHeader">
            <p className="eyebrow">Before you travel</p>
            <h2>Important Information</h2>
          </div>
          <div className="platformNotice">
            <ul>
              <li>Send your flight number and arrival time when enquiring.</li>
              <li>Arrive at the harbour at least 20 minutes before departure.</li>
              <li>Schedules may change due to weather and sea conditions.</li>
              <li>Advance booking is highly recommended in peak season.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="platformCta">
        <div className="platformContainer">
          <h2>Book Your {transfer.title}</h2>
          <p>
            Send your travel date, flight number, direction and passenger count.
            We will confirm availability and send you the booking details.
          </p>
          <div className="platformButtonRow" style={{ justifyContent: "center" }}>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="platformButton"
            >
              💬 Book via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── Mobile sticky bar ── */}
      <div className="transferStickyBar" role="complementary" aria-label="Quick book">
        <div className="transferStickyContent">
          <span className="transferStickyPrice">{transfer.price}</span>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="platformButton transferStickyBtn"
            aria-label="Enquire now via WhatsApp"
          >
            Enquire Now
          </a>
        </div>
      </div>
    </main>
  );
}
