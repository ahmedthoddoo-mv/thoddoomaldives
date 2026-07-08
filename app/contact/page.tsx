import type { Metadata } from "next";
import ContactBookingHub from "@/components/contact/ContactBookingHub";
import { parsePlannerSearchParams } from "@/lib/planner";
import {
  generateExperienceLink,
  generateGeneralLink,
  generateTransferLink,
} from "@/lib/whatsapp";
import type { PlannerSearchParams } from "@/types/planner";

export const metadata: Metadata = {
  title: "Contact iThoddoo Maldives | Plan Your Thoddoo Trip",
  description:
    "Contact iThoddoo Maldives for Thoddoo guesthouses, airport transfers, excursions, and local island travel help.",
};

type ContactPageProps = {
  searchParams?: Promise<PlannerSearchParams>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const plannedTrip = parsePlannerSearchParams(resolvedSearchParams);
  const generalLink = generateGeneralLink({});
  const transferLink = generateTransferLink({});
  const excursionLink = generateExperienceLink({
    experience: "Thoddoo Trip Planning",
  });

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section
        className="relative flex min-h-[65vh] items-center bg-cover bg-center px-6 text-white md:px-12"
        style={{ backgroundImage: "url('/images/homepage/hero-1.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 max-w-4xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em]">
            Contact
          </p>
          <h1 className="text-5xl font-bold leading-tight md:text-7xl">
            Plan Your Thoddoo Trip
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/90">
            Tell us your travel dates, group size, and what you want to
            arrange. We will help with stays, airport transfers, excursions,
            and practical local island advice.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={generalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-green-500 px-6 py-3 font-semibold text-white transition hover:bg-green-600"
            >
              Message on WhatsApp
            </a>
            <a
              href="#contact-options"
              className="rounded-full border border-white px-6 py-3 font-semibold text-white"
            >
              View Contact Options
            </a>
          </div>
        </div>
      </section>

      <ContactBookingHub plannedTrip={plannedTrip} />

      <section id="contact-options" className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
          Get in Touch
        </p>
        <h2 className="mt-3 text-4xl font-bold">
          Local help before you arrive
        </h2>
        <p className="mt-4 max-w-3xl text-slate-600">
          WhatsApp is the fastest way to reach us. Send your dates and we will
          point you to the best options for your budget, arrival time, and plans
          on Thoddoo.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <a
            href={generalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-3xl bg-green-500 p-8 text-white shadow-sm transition hover:bg-green-600"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
              Fastest Reply
            </p>
            <h3 className="mt-3 text-3xl font-bold">WhatsApp</h3>
            <p className="mt-3 text-white/90">
              Ask about guesthouses, excursions, transfers, or a full Thoddoo
              itinerary.
            </p>
            <p className="mt-5 font-semibold">Adhu: +960 914 2538</p>
          </a>

          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
              Location
            </p>
            <h3 className="mt-3 text-3xl font-bold">Thoddoo Island</h3>
            <p className="mt-3 text-slate-600">
              Local travel help from Thoddoo, Maldives, with guidance for
              beaches, cafes, guesthouses, transfers, and island activities.
            </p>
            <p className="mt-5 font-semibold">Thoddoo, Maldives</p>
          </div>

          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
              Best For
            </p>
            <h3 className="mt-3 text-3xl font-bold">Trip Planning</h3>
            <p className="mt-3 text-slate-600">
              Share your arrival date and travel style. We can suggest the
              right transfer, stay, and island experiences.
            </p>
            <p className="mt-5 font-semibold">Stays, transfers, excursions</p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-4xl font-bold">What can we help with?</h2>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Airport Transfers",
                text: "Send your flight number, arrival time, and number of guests. We will recommend the best transfer to Thoddoo.",
                href: transferLink,
                label: "Ask About Transfers",
              },
              {
                title: "Excursions",
                text: "Plan turtle snorkeling, sandbank trips, fishing, dolphin cruises, and other local island experiences.",
                href: excursionLink,
                label: "Ask About Excursions",
              },
              {
                title: "Guesthouse Stays",
                text: "Tell us your check-in date, check-out date, room needs, and budget so we can help with suitable options.",
                href: generalLink,
                label: "Ask About Stays",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border bg-white p-8 shadow-sm"
              >
                <h3 className="text-2xl font-bold">{item.title}</h3>
                <p className="mt-4 text-slate-600">{item.text}</p>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-block rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
                >
                  {item.label}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
              Before You Message
            </p>
            <h2 className="mt-3 text-4xl font-bold">
              Details that help us reply faster
            </h2>
          </div>

          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <ul className="space-y-4 text-slate-700">
              <li>Travel dates and number of guests</li>
              <li>Flight number and arrival time, if you need a transfer</li>
              <li>Preferred stay type, room count, and budget</li>
              <li>Excursions or experiences you want to book</li>
              <li>Any special requests for families, couples, or groups</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl font-bold">Ready to plan your island stay?</h2>
          <p className="mt-5 text-lg text-white/80">
            Message us on WhatsApp and we will help you arrange the practical
            details for a smooth Thoddoo trip.
          </p>
          <a
            href={generalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-full bg-green-500 px-8 py-4 text-lg font-semibold text-white transition hover:bg-green-600"
          >
            Contact iThoddoo Maldives
          </a>
        </div>
      </section>
    </main>
  );
}
