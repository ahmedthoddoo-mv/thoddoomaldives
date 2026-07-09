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
    <main className="min-h-screen bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(guideJsonLd) }}
      />
      <section
        className="relative flex min-h-[60vh] items-center bg-cover bg-center px-6 text-white md:px-12"
        style={{ backgroundImage: "url('/images/homepage/hero-1.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em]">
            Travel Guide
          </p>
          <h1 className="text-5xl font-bold md:text-7xl">
            Thoddoo Travel Guide
          </h1>
          <p className="mt-6 text-lg text-white/90">
            Useful island information before you arrive in Thoddoo.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {guides.map(([icon, title, desc]) => (
            <div key={title} className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="text-4xl">{icon}</div>
              <h2 className="mt-4 text-2xl font-bold">{title}</h2>
              <p className="mt-3 text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
