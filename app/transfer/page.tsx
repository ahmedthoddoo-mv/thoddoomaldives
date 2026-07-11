import type { Metadata } from "next";
import { TransferRepository } from "@/lib/repositories";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Thoddoo Airport Transfers",
  description:
    "Compare and arrange Thoddoo airport transfers by public speedboat, private speedboat, ferry, or seaplane with local schedule guidance.",
  path: "/transfer",
  image: "/images/hero-thoddoo.jpg",
});

export default function TransferPage() {
  const options = TransferRepository.findAll();

  return (
    <main className="platformPage">
      <section
        className="platformHero"
        style={{ backgroundImage: "url('/images/hero-thoddoo.jpg')" }}
      >
        <div className="platformHeroInner">
          <p className="eyebrow">Airport Transfers</p>
          <h1>Travel to Thoddoo</h1>
          <p>
            We help arrange the best transfer from Velana International Airport
            to Thoddoo Island. Choose the option that best suits your budget and
            schedule.
          </p>
        </div>
      </section>

      <section className="platformSection">
        <div className="platformContainer">
          <div className="platformSectionHeader">
            <p className="eyebrow">Transfer options</p>
            <h2>Choose Your Transfer</h2>
            <p>We can arrange all transfer options before your arrival.</p>
          </div>

          <div className="platformGrid platformGridTwo">
            {options.map((option) => (
              <article key={option.id} className="platformCard">
                <div
                  className="platformCardImage"
                  style={{ backgroundImage: `url('${option.image}')` }}
                />
                <div className="platformCardBody">
                  <h3 className="mt-4">{option.title}</h3>

                  <p><strong>Duration:</strong> {option.duration}</p>
                  <p className="font-semibold text-cyan-700">{option.price}</p>

                  <ul className="mt-6 space-y-3 text-slate-600">
                    {option.highlights.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="platformSection platformSectionMuted">
        <div className="platformContainer">
          <div className="platformSectionHeader">
            <p className="eyebrow">Travel notes</p>
            <h2>Before You Travel</h2>
          </div>
          <div className="platformNotice">
            <ul>
              <li>Please send your flight details before arrival.</li>
              <li>We will recommend the best transfer based on your landing time.</li>
              <li>Transfer schedules may change due to weather conditions.</li>
              <li>Seaplane flights operate only during daylight hours.</li>
              <li>Advance booking is highly recommended.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="platformCta">
        <div className="platformContainer">
          <h2>Need Help Arranging Your Transfer?</h2>
          <p>
            Send us your arrival date, flight number and number of guests.
            We&apos;ll recommend the best transfer option and arrange everything for you.
          </p>

          <a
            href="https://wa.me/9609142538?text=Hi%20I%20need%20help%20arranging%20my%20transfer%20to%20Thoddoo"
            target="_blank"
            rel="noopener noreferrer"
            className="platformButton mt-8"
          >
            Book Transfer via WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}
