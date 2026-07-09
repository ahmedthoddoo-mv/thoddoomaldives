import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, createPageMetadata, jsonLdScript } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Thoddoo Travel Guide",
  description:
    "Read practical Thoddoo travel guidance for Bikini Beach, money, restaurants, transfers, dress code, weather, and local island planning.",
  path: "/guide",
  image: "/images/homepage/hero-1.jpg",
});

export default function GuidePage() {
  const guideJsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristInformationCenter",
    name: "Thoddoo Travel Guide",
    url: `${SITE_URL}/guide`,
    description:
      "Practical local travel guidance for planning a Thoddoo Maldives island trip.",
    areaServed: {
      "@type": "Place",
      name: "Thoddoo, Maldives",
    },
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  const guides = [
    ["🏖️", "Bikini Beach", "Where tourists can swim and relax."],
    ["💵", "Money & ATM", "Bring cash; check ATM availability before arrival."],
    ["🍽️", "Restaurants", "Local cafés, seafood, Maldivian food, and snacks."],
    ["🚤", "Transfers", "Speedboat, ferry, private boat, and seaplane options."],
    ["👕", "Dress Code", "Respect local island culture outside bikini beach."],
    ["🌦️", "Best Time to Visit", "Sunny season is popular, but Thoddoo is beautiful year-round."],
  ];

  return (
    <main className="platformPage">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(guideJsonLd) }}
      />
      <section
        className="platformHero"
        style={{ backgroundImage: "url('/images/homepage/hero-1.jpg')" }}
      >
        <div className="platformHeroInner">
          <p className="eyebrow">Travel Guide</p>
          <h1>Thoddoo Travel Guide</h1>
          <p>
            Useful island information before you arrive in Thoddoo.
          </p>
        </div>
      </section>

      <section className="platformSection">
        <div className="platformContainer">
          <div className="platformGrid platformGridThree">
            {guides.map(([icon, title, desc]) => (
              <article key={title} className="platformCard">
                <div className="platformCardBody">
                  <div className="text-4xl">{icon}</div>
                  <h3 className="mt-4">{title}</h3>
                  <p>{desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
