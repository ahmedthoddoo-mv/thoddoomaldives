"use client";

import { BookingWidget } from "@/components/booking/BookingWidget";
import ExperienceCard from "@/components/cards/ExperienceCard";
import TestimonialCard from "@/components/cards/TestimonialCard";
import PropertyAmenities from "@/components/property/PropertyAmenities";
import PropertyGallery from "@/components/property/PropertyGallery";
import PropertyMapPlaceholder from "@/components/property/PropertyMapPlaceholder";
import PropertyRoomCard from "@/components/property/PropertyRoomCard";
import StickyBookingCard from "@/components/property/StickyBookingCard";
import Badge from "@/components/ui/Badge";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import { testimonials } from "@/data/testimonials";
import { ExperienceRepository } from "@/lib/repositories";
import { generateGuesthouseLink } from "@/lib/whatsapp";
import type { Guesthouse } from "@/types/guesthouse";

const trustItems = [
  "Verified Local Partner",
  "Fast WhatsApp Support",
  "Breakfast Included",
  "Transfer Assistance",
];

export default function PropertyPage({
  guesthouse,
}: {
  guesthouse: Guesthouse;
}) {
  const galleryImages =
    guesthouse.gallery.length > 0 ? guesthouse.gallery : [guesthouse.heroImage];
  const bookingLink = generateGuesthouseLink({
    phone: guesthouse.whatsapp,
    guesthouse: guesthouse.name,
  });
  const experiences = ExperienceRepository.findAll();
  const relatedExperiences = experiences.filter((experience) =>
    guesthouse.relatedExperienceSlugs.includes(experience.slug)
  );
  const guestReviews = testimonials.filter((testimonial) =>
    guesthouse.testimonialIds.includes(testimonial.id)
  );
  const bookingRooms = guesthouse.rooms.map((room) => ({
    id: room.name.toLowerCase().replaceAll(" ", "-"),
    name: room.name,
    nightlyRate: Number(room.price.replace(/[^0-9]/g, "")) || 0,
    capacity: room.capacity
  }));

  return (
    <main className="min-h-screen bg-white pb-24 text-slate-900 lg:pb-0">
      <PropertyGallery images={galleryImages} propertyName={guesthouse.name} />

      <section className="py-12">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{guesthouse.rating} guest rating</Badge>
                <Badge>Verified Partner</Badge>
                <Badge>Verified Membership</Badge>
                <span className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                  {guesthouse.distanceToBeach}
                </span>
                <span className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                  From {guesthouse.priceFrom}
                </span>
              </div>

              <h1 className="mt-5 text-5xl font-bold leading-tight md:text-7xl">
                {guesthouse.name}
              </h1>
              <p className="mt-5 max-w-3xl text-xl leading-8 text-slate-600">
                {guesthouse.description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={bookingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-green-600 px-7 py-4 font-semibold text-white transition hover:bg-green-700"
                >
                  Book Now on WhatsApp
                </a>
                <a
                  href="#rooms"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 px-7 py-4 font-semibold text-slate-900 transition hover:border-cyan-700 hover:text-cyan-800"
                >
                  View Rooms
                </a>
              </div>

              <dl className="mt-8 grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6 md:grid-cols-3">
                <div>
                  <dt className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                    Location
                  </dt>
                  <dd className="mt-1 font-semibold">{guesthouse.location}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                    Bikini Beach
                  </dt>
                  <dd className="mt-1 font-semibold">
                    {guesthouse.distanceToBeach}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                    Price From
                  </dt>
                  <dd className="mt-1 font-semibold">{guesthouse.priceFrom}</dd>
                </div>
              </dl>

              <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {trustItems.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4"
                  >
                    <p className="text-sm font-bold text-cyan-900">{item}</p>
                  </div>
                ))}
              </section>

              <section id="rooms" className="mt-16 scroll-mt-28">
                <SectionTitle eyebrow="Rooms" title="Choose Your Room" />
                <div className="mt-8 grid gap-8">
                  {guesthouse.rooms.map((room) => (
                    <PropertyRoomCard
                      key={room.name}
                      room={room}
                      guesthouseName={guesthouse.name}
                      whatsapp={guesthouse.whatsapp}
                    />
                  ))}
                </div>
              </section>

              <section className="mt-16">
                <SectionTitle eyebrow="Amenities" title="What is included" />
                <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
                  <PropertyAmenities amenities={guesthouse.amenities} />
                </div>
              </section>

              <section className="mt-16">
                <BookingWidget
                  crmRecordId="crm-thoddoo-sun-sky"
                  partnerId="partner-thoddoo-sun-sky"
                  propertyId={guesthouse.id}
                  propertyName={guesthouse.name}
                  propertySlug={guesthouse.slug}
                  rooms={bookingRooms}
                  whatsapp={guesthouse.whatsapp}
                />
              </section>

              <section className="mt-16">
                <SectionTitle eyebrow="Policies" title="Stay policies" />
                <div className="mt-8 grid gap-5 md:grid-cols-3">
                  {[
                    ["Check-in", "From 14:00. Early check-in can be requested."],
                    ["Check-out", "By 12:00. Late check-out depends on availability."],
                    ["Booking", "No payment is collected online. Confirm details through WhatsApp."]
                  ].map(([title, text]) => (
                    <article key={title} className="rounded-3xl border bg-white p-6 shadow-sm">
                      <h3 className="text-2xl font-bold">{title}</h3>
                      <p className="mt-3 leading-7 text-slate-600">{text}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="mt-16">
                <SectionTitle eyebrow="Transfers" title="Arrival support" />
                <div className="mt-8 grid gap-5 md:grid-cols-3">
                  {[
                    ["Airport Transfer", "Coordinate airport arrival support and speedboat guidance."],
                    ["Speedboat Transfer", "Public and private options can be requested with your booking."],
                    ["Ferry Transfer", "Budget-friendly ferry guidance for flexible travelers."]
                  ].map(([title, text]) => (
                    <article key={title} className="rounded-3xl border bg-white p-6 shadow-sm">
                      <h3 className="text-2xl font-bold">{title}</h3>
                      <p className="mt-3 leading-7 text-slate-600">{text}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="mt-16">
                <SectionTitle eyebrow="About" title="About This Property" />
                <div className="mt-8 grid gap-6">
                  {guesthouse.about.map((section) => (
                    <article
                      key={section.title}
                      className="rounded-3xl border bg-white p-6 shadow-sm"
                    >
                      <h3 className="text-2xl font-bold">{section.title}</h3>
                      <p className="mt-4 text-lg leading-8 text-slate-600">
                        {section.body}
                      </p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="mt-16">
                <PropertyMapPlaceholder guesthouse={guesthouse} />
              </section>

              <section className="mt-16">
                <SectionTitle eyebrow="Nearby" title="Nearby Attractions" />
                <div className="mt-8 grid gap-5 md:grid-cols-3">
                  {guesthouse.nearbyAttractions.map((attraction) => (
                    <article
                      key={attraction.name}
                      className="rounded-3xl border bg-white p-6 shadow-sm"
                    >
                      <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
                        {attraction.distance}
                      </p>
                      <h3 className="mt-3 text-2xl font-bold">
                        {attraction.name}
                      </h3>
                      <p className="mt-3 leading-7 text-slate-600">
                        {attraction.description}
                      </p>
                    </article>
                  ))}
                </div>
              </section>

              {relatedExperiences.length > 0 && (
                <section className="mt-16">
                  <SectionTitle
                    eyebrow="Experiences"
                    title="Pair Your Stay With Local Experiences"
                  />
                  <div className="mt-8 grid gap-8 md:grid-cols-2">
                    {relatedExperiences.map((experience) => (
                      <ExperienceCard
                        key={experience.id}
                        experience={experience}
                      />
                    ))}
                  </div>
                </section>
              )}

              {guestReviews.length > 0 && (
                <section className="mt-16">
                  <SectionTitle eyebrow="Reviews" title="Guest Reviews" />
                  <div className="mt-8 grid gap-6 md:grid-cols-3">
                    {guestReviews.map((testimonial) => (
                      <TestimonialCard
                        key={testimonial.id}
                        testimonial={testimonial}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>

            <StickyBookingCard guesthouse={guesthouse} />
          </div>
        </Container>
      </section>
    </main>
  );
}
