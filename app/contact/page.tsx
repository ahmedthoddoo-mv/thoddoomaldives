import type { Metadata } from "next";
import ContactBookingHub from "@/components/contact/ContactBookingHub";
import { parsePlannerSearchParams } from "@/lib/planner";
import {
  generateExperienceLink,
  generateGeneralLink,
  generateTransferLink,
} from "@/lib/whatsapp";
import { createPageMetadata } from "@/lib/seo";
import type { PlannerSearchParams } from "@/types/planner";

export const metadata: Metadata = createPageMetadata({
  title: "Contact iThoddoo Maldives",
  description:
    "Contact iThoddoo Maldives for guesthouse booking help, airport transfers, excursions, restaurants, and local Thoddoo travel planning.",
  path: "/contact",
  image: "/images/homepage/hero-1.jpg",
});

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
    <main className="platformPage">
      <section
        className="platformHero"
        style={{ backgroundImage: "url('/images/homepage/hero-1.jpg')" }}
      >
        <div className="platformHeroInner">
          <p className="eyebrow">Contact</p>
          <h1>Plan Your Thoddoo Trip</h1>
          <p>
            Tell us your travel dates, group size, and what you want to
            arrange. We will help with stays, airport transfers, excursions,
            and practical local island advice.
          </p>
          <div className="platformButtonRow">
            <a
              href={generalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="platformButton"
            >
              Message on WhatsApp
            </a>
            <a
              href="#contact-options"
              className="platformButtonSecondary"
            >
              View Contact Options
            </a>
          </div>
        </div>
      </section>

      <ContactBookingHub plannedTrip={plannedTrip} />

      <section id="contact-options" className="platformSection">
        <div className="platformContainer">
          <div className="platformSectionHeader">
            <p className="eyebrow">Get in Touch</p>
            <h2>Local help before you arrive</h2>
            <p>
              WhatsApp is the fastest way to reach us. Send your dates and we will
              point you to the best options for your budget, arrival time, and plans
              on Thoddoo.
            </p>
          </div>

          <div className="platformGrid platformGridThree">
            <a href={generalLink} target="_blank" rel="noopener noreferrer" className="platformCard bg-green-600 text-white">
              <div className="platformCardBody">
                <p className="eyebrow text-white/80">Fastest Reply</p>
                <h3 className="text-white">WhatsApp</h3>
                <p className="text-white/90">
                  Ask about guesthouses, excursions, transfers, or a full Thoddoo itinerary.
                </p>
                <p className="font-semibold text-white">Adhu: +960 914 2538</p>
              </div>
            </a>

            <article className="platformCard">
              <div className="platformCardBody">
                <p className="eyebrow">Location</p>
                <h3>Thoddoo Island</h3>
                <p>
                  Local travel help from Thoddoo, Maldives, with guidance for
                  beaches, cafes, guesthouses, transfers, and island activities.
                </p>
                <p className="font-semibold text-slate-900">Thoddoo, Maldives</p>
              </div>
            </article>

            <article className="platformCard">
              <div className="platformCardBody">
                <p className="eyebrow">Best For</p>
                <h3>Trip Planning</h3>
                <p>
                  Share your arrival date and travel style. We can suggest the
                  right transfer, stay, and island experiences.
                </p>
                <p className="font-semibold text-slate-900">Stays, transfers, excursions</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="platformSection platformSectionMuted">
        <div className="platformContainer">
          <div className="platformSectionHeader">
            <p className="eyebrow">Planning support</p>
            <h2>What can we help with?</h2>
          </div>

          <div className="platformGrid platformGridThree">
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
              <article key={item.title} className="platformCard">
                <div className="platformCardBody">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="platformButton mt-6"
                >
                  {item.label}
                </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="platformSection">
        <div className="platformContainer grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="platformSectionHeader">
            <p className="eyebrow">Before You Message</p>
            <h2>Details that help us reply faster</h2>
          </div>

          <div className="platformNotice">
            <ul>
              <li>Travel dates and number of guests</li>
              <li>Flight number and arrival time, if you need a transfer</li>
              <li>Preferred stay type, room count, and budget</li>
              <li>Excursions or experiences you want to book</li>
              <li>Any special requests for families, couples, or groups</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="platformCta">
        <div className="platformContainer">
          <h2>Ready to plan your island stay?</h2>
          <p>
            Message us on WhatsApp and we will help you arrange the practical
            details for a smooth Thoddoo trip.
          </p>
          <a
            href={generalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="platformButton mt-8"
          >
            Contact iThoddoo Maldives
          </a>
        </div>
      </section>
    </main>
  );
}
