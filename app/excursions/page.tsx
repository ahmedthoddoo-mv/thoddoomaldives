import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ExperienceCard from "@/components/ExperienceCard";
import ExcursionInquiryForm from "@/components/ExcursionInquiryForm";
import {
  experiences,
  experienceCategories,
  featuredExperience,
  type ExperienceCategory,
} from "@/lib/experiences";
import { generateExperienceLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Excursions in Thoddoo | iThoddoo Maldives",
  description:
    "Book premium Thoddoo excursions — turtle snorkeling, sandbank trips, sunset fishing, dolphin cruises, and local island adventures.",
};

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
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar />

      {/* Hero */}
      <section
        className="relative flex min-h-[70vh] items-center bg-cover bg-center px-6 text-white md:px-12"
        style={{ backgroundImage: "url('/images/homepage/hero-1.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 max-w-4xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em]">
            Thoddoo Excursions
          </p>

          <h1 className="text-5xl font-bold leading-tight md:text-7xl">
            Unforgettable Island Adventures
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-white/90">
            Snorkel with turtles, cruise to pristine sandbanks, fish at sunset,
            and explore the real Maldives — all arranged with trusted local
            guides on Thoddoo Island.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#excursions"
              className="rounded-full bg-white px-6 py-3 font-semibold text-slate-900"
            >
              Browse Excursions
            </a>

            <a
              href={generalBookingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white px-6 py-3 font-semibold text-white"
            >
              Book on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Featured Excursion */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
          Featured Experience
        </p>

        <h2 className="mt-3 text-4xl font-bold">
          {featuredExperience.title}
        </h2>

        <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm md:grid md:grid-cols-2">
          <div
            className="min-h-[360px] bg-cover bg-center"
            style={{
              backgroundImage: `url('${featuredExperience.image ?? "/images/hero-thoddoo.jpg"}')`,
            }}
            role="img"
            aria-label={featuredExperience.title}
          />

          <div className="p-6 md:p-10">
            <div className="text-5xl">{featuredExperience.icon}</div>

            <p className="mt-4 text-slate-600">
              {featuredExperience.description}
            </p>

            <div className="mt-6 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
              <p>⏱ {featuredExperience.duration}</p>
              <p className="font-semibold text-cyan-700">
                💰 {featuredExperience.price}
              </p>
            </div>

            <ul className="mt-6 space-y-2 text-slate-600">
              {featuredExperience.highlights.slice(0, 4).map((highlight) => (
                <li key={highlight}>✅ {highlight}</li>
              ))}
            </ul>

            <a
              href={generateExperienceLink({
                experience: featuredExperience.title,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-block rounded-full bg-slate-900 px-6 py-3 font-semibold text-white"
            >
              Book {featuredExperience.title}
            </a>
          </div>
        </div>
      </section>

      {/* Excursion Grid by Category */}
      <section id="excursions" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
            All Excursions
          </p>

          <h2 className="mt-3 text-4xl font-bold">
            Choose Your Thoddoo Adventure
          </h2>

          <p className="mt-4 max-w-3xl text-slate-600">
            Every excursion is arranged with local operators who know Thoddoo
            best. Prices are indicative — send us your dates and group size for
            a confirmed quote.
          </p>

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

      {/* Before You Book */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-3xl font-bold">Before You Book</h2>

          <div className="mt-6 rounded-3xl border bg-white p-8 shadow-sm">
            <ul className="space-y-4 text-slate-700">
              <li>
                ✅ Excursions are subject to weather and sea conditions — we
                will confirm on the day if needed.
              </li>
              <li>
                ✅ Advance booking is recommended, especially during peak season
                (November–April).
              </li>
              <li>
                ✅ Most excursions depart from Thoddoo harbour — we will share
                the exact meeting point after booking.
              </li>
              <li>
                ✅ Private charters are available for couples, families, and
                groups on request.
              </li>
              <li>
                ✅ Need an airport transfer too?{" "}
                <a href="/transfer" className="font-semibold text-cyan-700">
                  View transfer options
                </a>
                .
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <ExcursionInquiryForm />
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl font-bold">
            Ready to Explore Thoddoo?
          </h2>

          <p className="mt-5 text-lg text-white/80">
            Send us your preferred date, number of guests, and which excursions
            interest you. We will arrange everything and confirm pricing on
            WhatsApp.
          </p>

          <a
            href={generalBookingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-full bg-green-500 px-8 py-4 text-lg font-semibold text-white transition hover:bg-green-600"
          >
            Book Excursions via WhatsApp
          </a>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  );
}
