import type { Metadata } from "next";
import { TransferListingCard } from "@/components/transfer/TransferListingCard";
import { getLiveTransfers } from "@/lib/repositories/liveReads";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Thoddoo Airport Transfers",
  description:
    "Compare verified Thoddoo airport transfers with public pricing, route details, schedule guidance, and WhatsApp booking support.",
  path: "/transfer",
  image: "/images/hero-thoddoo.jpg",
});

export default async function TransferPage() {
  const transferRead = await getLiveTransfers();
  const options = transferRead.data;

  return (
    <main className="platformPage transferPage">
      <section className="platformHero transferHero" style={{ backgroundImage: "url('/images/homepage/hero-6.jpg')" }}>
        <div className="platformHeroInner transferHeroLayout">
          <div>
            <p className="eyebrow">Airport transfers</p>
            <h1>Premium transfer planning for Thoddoo arrivals and departures</h1>
            <p>Browse verified public transfer options with honest schedule guidance, clear public pricing, and direct WhatsApp assistance before you travel.</p>
          </div>
          <div className="transferHeroPanel">
            <strong>Nasru Speed Boat</strong>
            <p>Daily speedboat timetable, airport jetty route, and local support from enquiry to final confirmation.</p>
            <span>Availability confirmed after enquiry</span>
          </div>
        </div>
      </section>

      <section className="platformSection">
        <div className="platformContainer">
          <div className="platformSectionHeader">
            <p className="eyebrow">Verified public options</p>
            <h2>Choose your airport transfer</h2>
            <p>Only published and verified public transfer listings are shown here. Seat counts are confirmed manually after enquiry.</p>
            {transferRead.error ? <p>{transferRead.error}</p> : null}
          </div>

          <div className="transferListingGrid">
            {options.map((option) => (
              <TransferListingCard key={option.id} transfer={option} />
            ))}
          </div>
        </div>
      </section>

      <section className="platformSection platformSectionMuted">
        <div className="platformContainer">
          <div className="platformSectionHeader">
            <p className="eyebrow">Before you book</p>
            <h2>What to expect</h2>
          </div>
          <div className="transferInfoGrid">
            {[
              "Schedules can change due to weather and sea conditions.",
              "Please share flight details so the team can guide you to the most suitable scheduled service.",
              "Availability is confirmed after enquiry because operator seat management is still manual.",
            ].map((item) => (
              <article key={item} className="transferInfoCard">
                <p>{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
