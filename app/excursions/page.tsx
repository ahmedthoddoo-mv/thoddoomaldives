import type { Metadata } from "next";
import ExperienceCard from "@/components/ExperienceCard";
import ExcursionInquiryForm from "@/components/ExcursionInquiryForm";
import {
  experiences,
  experienceCategories,
  featuredExperience,
  type ExperienceCategory,
} from "@/lib/experiences";
import { createPageMetadata } from "@/lib/seo";
import { generateExperienceLink } from "@/lib/whatsapp";

export const metadata: Metadata = createPageMetadata({
  title: "Thoddoo Excursions & Island Experiences",
  description:
    "Book Thoddoo excursions including turtle snorkeling, sandbank trips, sunset fishing, dolphin cruises, water sports, and local farm tours.",
  path: "/excursions",
  image: "/images/homepage/hero-4.jpg",
});

const categoryOrder: ExperienceCategory[] = [
  "snorkeling",
  "island",
  "fishing",
  "water-sports",
  "culture",
];

export default function ExcursionsPage() {
  const generalBookingLink = generateExperienceLink({
    experience: "Thoddoo Excursion",
  });

  return (
    <main className="platformPage">
      <section
        className="platformHero"
        style={{ backgroundImage: "url('/images/homepage/hero-4.jpg')" }}
      >
        <div className="platformHeroInner">
          <p className="eyebrow">Thoddoo Excursions</p>
          <h1>Unforgettable Island Adventures</h1>
          <p>
            Snorkel with turtles, cruise to pristine sandbanks, fish at sunset,
            and explore the real Maldives — all arranged with trusted local
            guides on Thoddoo Island.
          </p>

          <div className="platformButtonRow">
            <a
              href="#excursions"
              className="platformButton"
            >
              Browse Excursions
            </a>

            <a
              href={generalBookingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="platformButtonSecondary"
            >
              Book on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="platformSection">
        <div className="platformContainer">
          <div className="platformSectionHeader">
            <p className="eyebrow">Featured Experience</p>
            <h2>{featuredExperience.title}</h2>
          </div>

          <div className="platformCard md:grid md:grid-cols-2">
            <div
              className="min-h-[360px] bg-cover bg-center"
              style={{
                backgroundImage: `url('${featuredExperience.image ?? "/images/hero-thoddoo.jpg"}')`,
              }}
              role="img"
              aria-label={featuredExperience.title}
            />

            <div className="platformCardBody">
              <div className="text-5xl">{featuredExperience.icon}</div>

              <p>{featuredExperience.description}</p>

              <div className="platformPillRow mt-6">
                <span className="platformPill">{featuredExperience.duration}</span>
                <span className="platformPill">{featuredExperience.price}</span>
              </div>

              <ul className="mt-6 space-y-2 text-slate-600">
                {featuredExperience.highlights.slice(0, 4).map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>

              <a
                href={generateExperienceLink({
                  experience: featuredExperience.title,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="platformButton mt-8"
              >
                Book {featuredExperience.title}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="excursions" className="platformSection platformSectionMuted">
        <div className="platformContainer">
          <div className="platformSectionHeader">
            <p className="eyebrow">All Excursions</p>
            <h2>Choose Your Thoddoo Adventure</h2>
            <p>
              Every excursion is arranged with local operators who know Thoddoo
              best. Prices are indicative — send us your dates and group size for
              a confirmed quote.
            </p>
          </div>

          <div className="mt-16 space-y-20">
            {categoryOrder.map((category) => {
              const items = experiences.filter((e) => e.category === category);
              if (items.length === 0) return null;

              const meta = experienceCategories[category];

              return (
                <div key={category}>
                  <h3 className="text-2xl font-bold">{meta.label}</h3>
                  <p className="mt-2 text-slate-600">{meta.description}</p>

                  <div className="mt-8 grid gap-8 lg:grid-cols-2">
                    {items.map((experience) => (
                      <ExperienceCard
                        key={experience.slug}
                        experience={experience}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="platformSection">
        <div className="platformContainer">
          <div className="platformSectionHeader">
            <p className="eyebrow">Planning notes</p>
            <h2>Before You Book</h2>
          </div>

          <div className="platformNotice">
            <ul>
              <li>
                Excursions are subject to weather and sea conditions — we
                will confirm on the day if needed.
              </li>
              <li>
                Advance booking is recommended, especially during peak season
                (November–April).
              </li>
              <li>
                Most excursions depart from Thoddoo harbour — we will share
                the exact meeting point after booking.
              </li>
              <li>
                Private charters are available for couples, families, and
                groups on request.
              </li>
              <li>
                Need an airport transfer too?{" "}
                <a href="/transfer" className="font-semibold text-cyan-700">
                  View transfer options
                </a>
                .
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="platformSection platformSectionMuted">
        <div className="platformContainer max-w-3xl">
          <ExcursionInquiryForm />
        </div>
      </section>

      <section className="platformCta">
        <div className="platformContainer">
          <h2>Ready to Explore Thoddoo?</h2>
          <p>
            Send us your preferred date, number of guests, and which excursions
            interest you. We will arrange everything and confirm pricing on
            WhatsApp.
          </p>

          <a
            href={generalBookingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="platformButton mt-8"
          >
            Book Excursions via WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}
