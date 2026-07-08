import type { Metadata } from "next";
import Link from "next/link";
import TestimonialCard from "@/components/TestimonialCard";
import TripPlanner from "@/components/planner/TripPlanner";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import { guesthouses } from "@/data/guesthouses";
import { generateGuesthouseLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "iThoddoo Maldives | Stays, Experiences & Local Island Travel",
  description:
    "Discover the real Maldives with luxury stays, unforgettable experiences, and local concierge service in Thoddoo.",
};

const trustItems = [
  {
    title: "Local Experts",
    text: "Island-based guidance from people who know Thoddoo, transfers, beaches, and trusted local operators.",
  },
  {
    title: "Verified Guesthouses",
    text: "Curated stays with practical room, amenity, location, and booking details before you arrive.",
  },
  {
    title: "Fast WhatsApp Support",
    text: "Share your dates and questions, then get quick help from a real local contact.",
  },
  {
    title: "Trusted Local Concierge",
    text: "Plan stays, transfers, excursions, and island days with one clear support channel.",
  },
];

const reasons = [
  {
    icon: "01",
    title: "Real Local Knowledge",
    text: "Specific Thoddoo advice instead of generic Maldives travel content.",
  },
  {
    icon: "02",
    title: "Stress-Free Vacation",
    text: "Arrival, transfer, stay, and activity planning made easier before you land.",
  },
  {
    icon: "03",
    title: "Handpicked Experiences",
    text: "Snorkeling, sandbanks, fishing, water sports, farms, and local island life.",
  },
  {
    icon: "04",
    title: "Reliable Support",
    text: "A human local concierge helps you choose, confirm, and prepare.",
  },
];

const experiencePlaceholders = [
  {
    title: "Snorkeling",
    image: "/images/homepage/hero-4.jpg",
    description:
      "Explore Thoddoo reef areas with local guidance, clear lagoons, and a chance to see turtles.",
  },
  {
    title: "Sandbank",
    image: "/images/hero-thoddoo.jpg",
    description:
      "Spend a picture-perfect island day on soft white sand surrounded by turquoise water.",
  },
  {
    title: "Fishing",
    image: "/images/homepage/hero-1.jpg",
    description:
      "Join a traditional fishing trip and enjoy the calm ocean around golden hour.",
  },
  {
    title: "Water Sports",
    image: "/images/hero-thoddoo.jpg",
    description:
      "Add lagoon fun to your holiday with kayaking, paddleboarding, and local water activities.",
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
  src: "/images/homepage/hero-1.jpg",
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-slate-950/85" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950 to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="max-w-4xl">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.35em] text-cyan-100">
              Thoddoo Island, Maldives
            </p>
            <h1 className="text-5xl font-bold leading-[0.95] md:text-7xl lg:text-8xl">
              Discover the Real Maldives
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/85 md:text-xl">
              Luxury stays, unforgettable experiences and local concierge
              service in Thoddoo.
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

        <a
          href="#trust"
          className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/70"
        >
          Scroll
          <span className="h-10 w-px animate-pulse bg-white/60" />
        </a>
      </section>

      <section id="trust" className="relative z-10 -mt-20 px-6 pb-16">
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

      <TripPlanner />

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
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/stay/${guesthouse.slug}`}
                      className="inline-block rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700"
                    >
                      View Details
                    </Link>
                    <a
                      href={generateGuesthouseLink({
                        phone: guesthouse.whatsapp,
                        guesthouse: guesthouse.name,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-full bg-green-500 px-6 py-3 font-semibold text-white transition hover:bg-green-600"
                    >
                      Book Now
                    </a>
                  </div>
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
              title="Unforgettable Thoddoo experiences"
            />
            <Link
              href="/excursions"
              className="font-semibold text-cyan-700 hover:text-cyan-900"
            >
              Explore all experiences
            </Link>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {experiencePlaceholders.map((experience) => (
              <article
                key={experience.title}
                className="group overflow-hidden rounded-3xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className="min-h-72 bg-slate-200 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(rgb(15 23 42 / 0.12), rgb(15 23 42 / 0.12)), url('${experience.image}')`,
                  }}
                />
                <div className="p-6">
                  <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
                    Premium Experience
                  </p>
                  <h3 className="mt-3 text-2xl font-bold">
                    {experience.title}
                  </h3>
                  <p className="mt-3 leading-7 text-slate-600">
                    {experience.description}
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
            {reasons.map((reason) => (
              <Card key={reason.title}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-sm font-bold text-cyan-700">
                  {reason.icon}
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
          style={{ backgroundImage: "url('/images/hero-thoddoo.jpg')" }}
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
