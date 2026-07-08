import type { Metadata } from "next";
import Link from "next/link";
import TestimonialCard from "@/components/TestimonialCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import { guesthouses } from "@/data/guesthouses";
import { experiences } from "@/lib/experiences";

export const metadata: Metadata = {
  title: "iThoddoo Maldives | Stays, Experiences & Local Island Travel",
  description:
    "Plan your Thoddoo Maldives trip with local experts. Discover verified stays, premium experiences, transfers, and fast WhatsApp support.",
};

const trustItems = [
  {
    title: "Local Experts",
    text: "Island-based help from people who know Thoddoo, transfer timing, guesthouses, beaches, and local operators.",
  },
  {
    title: "Verified Properties",
    text: "Structured property pages with practical room, amenity, location, and booking details.",
  },
  {
    title: "Fast WhatsApp Support",
    text: "Ask questions, share your travel dates, and get help planning your stay directly on WhatsApp.",
  },
  {
    title: "Best Local Prices",
    text: "Connect with local partners and receive current stay, transfer, and experience options for your trip.",
  },
];

const reasons = [
  {
    title: "One Island, Deep Knowledge",
    text: "Focused Thoddoo guidance instead of generic Maldives advice.",
  },
  {
    title: "Smooth Arrival Planning",
    text: "Transfer help based on your flight time, budget, and group size.",
  },
  {
    title: "Curated Experiences",
    text: "Snorkeling, fishing, sandbanks, dolphins, farms, and local culture.",
  },
  {
    title: "Human Booking Support",
    text: "A real local team helps you choose, confirm, and prepare.",
  },
];

const testimonials = [
  {
    quote:
      "The transfer advice made our arrival simple, and the local recommendations helped us enjoy Thoddoo from day one.",
    name: "Maya R.",
    detail: "Couple trip",
  },
  {
    quote:
      "We wanted turtles, a quiet beach, and a clean guesthouse. Everything was explained clearly before we arrived.",
    name: "Daniel K.",
    detail: "Family holiday",
  },
  {
    quote:
      "Fast WhatsApp replies and practical island tips. It felt like planning with someone already on the island.",
    name: "Elena S.",
    detail: "Solo traveler",
  },
];

const featuredExperiences = experiences.slice(0, 3);

type HeroMedia =
  | {
      type: "image";
      src: string;
    }
  | {
      type: "video";
      src: string;
      poster: string;
    };

const heroMedia: HeroMedia = {
  type: "image",
  src: "/images/homepage/hero-6.jpg",
};

function HeroBackground({ media }: { media: HeroMedia }) {
  if (media.type === "video") {
    return (
      <video
        className="absolute inset-0 h-full w-full object-cover"
        poster={media.poster}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      >
        <source src={media.src} type="video/mp4" />
      </video>
    );
  }

  return (
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url('${media.src}')` }}
    />
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="relative flex min-h-screen items-center overflow-hidden bg-slate-950 px-6 pt-28 text-white md:px-12">
        <HeroBackground media={heroMedia} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950 to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="max-w-4xl">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.35em] text-cyan-100">
              Thoddoo Island, Maldives
            </p>
            <h1 className="text-5xl font-bold leading-[0.95] md:text-7xl lg:text-8xl">
              Plan a Maldives local island escape with people who know it best.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/85 md:text-xl">
              Discover verified stays, premium excursions, airport transfers,
              and practical Thoddoo travel help in one trusted place.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button href="/stay" variant="light">
                Book Your Stay
              </Button>
              <Button href="/excursions" variant="outline">
                Explore Experiences
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-20 px-6 pb-16">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          {trustItems.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/50 bg-white/95 p-6 shadow-xl backdrop-blur transition duration-300 hover:-translate-y-1"
            >
              <p className="text-lg font-bold">{item.title}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20">
        <Container>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionTitle
              eyebrow="Featured Guesthouses"
              title="Stay close to Thoddoo island life"
            />
            <Link
              href="/stay"
              className="font-semibold text-cyan-700 hover:text-cyan-900"
            >
              View all stays
            </Link>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {guesthouses.map((guesthouse) => (
              <article
                key={guesthouse.id}
                className="group overflow-hidden rounded-3xl border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className="min-h-80 bg-slate-200 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(rgb(15 23 42 / 0.08), rgb(15 23 42 / 0.08)), url('${guesthouse.heroImage}')`,
                  }}
                />
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    <Badge>Rating {guesthouse.rating}</Badge>
                    <span className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                      {guesthouse.distanceToBeach}
                    </span>
                  </div>
                  <h3 className="mt-5 text-3xl font-bold group-hover:text-cyan-700">
                    {guesthouse.name}
                  </h3>
                  <p className="mt-3 leading-7 text-slate-600">
                    {guesthouse.tagline}
                  </p>
                  <Link
                    href={`/stay/${guesthouse.slug}`}
                    className="mt-6 inline-block rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700"
                  >
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-slate-50 py-20">
        <Container>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionTitle
              eyebrow="Featured Experiences"
              title="Premium days on the water and island"
            />
            <Link
              href="/excursions"
              className="font-semibold text-cyan-700 hover:text-cyan-900"
            >
              Explore all experiences
            </Link>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {featuredExperiences.map((experience) => (
              <article
                key={experience.slug}
                className="group overflow-hidden rounded-3xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className="min-h-72 bg-slate-200 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(rgb(15 23 42 / 0.12), rgb(15 23 42 / 0.12)), url('${experience.image ?? "/images/hero-thoddoo.jpg"}')`,
                  }}
                />
                <div className="p-6">
                  <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
                    {experience.duration}
                  </p>
                  <h3 className="mt-3 text-2xl font-bold">
                    {experience.title}
                  </h3>
                  <p className="mt-3 leading-7 text-slate-600">
                    {experience.description}
                  </p>
                  <p className="mt-5 font-bold text-slate-900">
                    {experience.price}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionTitle
            eyebrow="Why Choose Us"
            title="Built for calm, confident island planning"
          />

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {reasons.map((reason, index) => (
              <Card key={reason.title}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-sm font-bold text-cyan-700">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-6 text-xl font-bold">{reason.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{reason.text}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-slate-950 py-20 text-white">
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-200">
              Guest Stories
            </p>
            <h2 className="mt-3 text-4xl font-bold">
              Trusted by travelers planning real Thoddoo stays
            </h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.name} {...testimonial} />
            ))}
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-white py-24">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: "url('/images/homepage/hero-3.jpg')" }}
        />
        <Container>
          <div className="relative rounded-3xl bg-slate-950 px-6 py-16 text-center text-white shadow-2xl md:px-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-200">
              Ready when you are
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-bold md:text-5xl">
              Tell us your dates and we will help shape the right Thoddoo trip.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/75">
              Share your arrival time, number of guests, and what you want to
              book. We will help with stays, transfers, and island experiences.
            </p>
            <div className="mt-10 flex justify-center">
              <Button href="/contact" variant="green">
                Start Planning on WhatsApp
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
