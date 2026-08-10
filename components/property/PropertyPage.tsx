"use client";

import { BookingWidget } from "@/components/booking/BookingWidget";
import PropertyAmenities from "@/components/property/PropertyAmenities";
import PropertyGallery from "@/components/property/PropertyGallery";
import PropertyMapPlaceholder from "@/components/property/PropertyMapPlaceholder";
import PropertyRoomCard from "@/components/property/PropertyRoomCard";
import { VerifiedBadge } from "@/components/partner/VerifiedBadge";
import Badge from "@/components/ui/Badge";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import { generateGuesthouseLink } from "@/lib/whatsapp";
import { getDirectBookingUrl, getGuesthouseBadgeState } from "@/lib/properties/guesthouse";
import type { Guesthouse } from "@/types/guesthouse";
import BookButton from "@/components/BookButton";

export default function PropertyPage({
  guesthouse,
  turnstileSiteKey = "",
}: {
  guesthouse: Guesthouse;
  turnstileSiteKey?: string;
}) {
  const galleryImages = guesthouse.gallery.length > 0 ? guesthouse.gallery : [guesthouse.heroImage];
  const heroImage = guesthouse.heroImage || galleryImages[0] || "/images/hero-thoddoo.jpg";
  const bookingLink = generateGuesthouseLink({
    phone: guesthouse.whatsapp,
    guesthouse: guesthouse.name,
  });
  const bookingRooms = guesthouse.rooms.map((room) => ({
    id: room.id ?? room.name.toLowerCase().replaceAll(" ", "-"),
    name: room.name,
    nightlyRate: room.nightlyRate ?? null,
    currency: room.currency,
    capacity: room.capacity
  }));
  const amenityList = guesthouse.amenities.filter(Boolean);
  const facilityList = (guesthouse.facilities ?? []).filter(Boolean);
  const aboutSections = guesthouse.about.filter((section) => section.body && section.body.trim());
  const badgeState = getGuesthouseBadgeState(guesthouse);
  const directBookingUrl = getDirectBookingUrl(guesthouse);
  type ContactItem = { label: string; value: string; href?: string | undefined };
  const contactItems = [
    guesthouse.address ? { label: "Address", value: guesthouse.address, href: guesthouse.mapUrl ? guesthouse.mapUrl : undefined } : null,
    guesthouse.phone ? { label: "Phone", value: guesthouse.phone, href: `tel:${guesthouse.phone}` } : null,
    guesthouse.email ? { label: "Email", value: guesthouse.email, href: `mailto:${guesthouse.email}` } : null,
    guesthouse.website ? { label: "Website", value: guesthouse.website, href: guesthouse.website } : null,
    guesthouse.whatsapp ? { label: "WhatsApp", value: guesthouse.whatsapp, href: bookingLink } : null
  ].reduce<ContactItem[]>((items, item) => {
    if (item) {
      items.push(item);
    }
    return items;
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 pb-24 text-slate-900 lg:pb-0">
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <img src={heroImage} alt={guesthouse.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-900/40" />
        </div>
        <Container>
          <div className="relative flex min-h-[30rem] items-end py-20 sm:py-24 lg:py-28">
            <div className="max-w-3xl rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur md:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{guesthouse.rating} guest rating</Badge>
                {badgeState.verified ? (
                  <VerifiedBadge label="Verified by iThoddoo Maldives" />
                ) : null}
                {badgeState.premium ? (
                  <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                    Premium Partner
                  </span>
                ) : null}
                {guesthouse.membershipBadge && !badgeState.premium ? (
                  <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                    {guesthouse.membershipBadge}
                  </span>
                ) : null}
                {guesthouse.priceFrom ? (
                  <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white">
                    From {guesthouse.priceFrom}
                  </span>
                ) : null}
              </div>
              <h1 className="mt-5 text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
                {guesthouse.name}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-100/95">
                {guesthouse.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <BookButton phone={guesthouse.whatsapp} name={guesthouse.name} />
                <a href="#rooms" className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20">
                  View rooms
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-100">
                {guesthouse.location ? <span className="rounded-full bg-white/15 px-3 py-2">{guesthouse.location}</span> : null}
                {guesthouse.checkIn ? <span className="rounded-full bg-white/15 px-3 py-2">Check-in {guesthouse.checkIn}</span> : null}
                {guesthouse.checkOut ? <span className="rounded-full bg-white/15 px-3 py-2">Check-out {guesthouse.checkOut}</span> : null}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <PropertyGallery images={galleryImages} propertyName={guesthouse.name} media={guesthouse.media} />

      <section className="py-12">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-8">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Stay overview</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">A premium stay on Thoddoo</h2>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  {guesthouse.tagline || guesthouse.description}
                </p>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {guesthouse.location ? <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-500">Location</p><p className="mt-1 font-semibold text-slate-900">{guesthouse.location}</p></div> : null}
                  {guesthouse.checkIn ? <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-500">Check-in</p><p className="mt-1 font-semibold text-slate-900">{guesthouse.checkIn}</p></div> : null}
                  {guesthouse.checkOut ? <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-500">Check-out</p><p className="mt-1 font-semibold text-slate-900">{guesthouse.checkOut}</p></div> : null}
                </div>
              </div>

              {guesthouse.rooms.length ? (
                <section id="rooms" className="scroll-mt-28">
                  <SectionTitle eyebrow="Rooms" title="Choose Your Room" />
                  <div className="mt-6 grid gap-6">
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
              ) : null}

              {amenityList.length || facilityList.length ? (
                <section>
                  <SectionTitle eyebrow="Amenities" title="What is included" />
                  <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    {amenityList.length ? (
                      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-xl font-semibold text-slate-900">Amenities</h3>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {amenityList.map((amenity) => (
                            <span key={amenity} className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">{amenity}</span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {facilityList.length ? (
                      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-xl font-semibold text-slate-900">Facilities</h3>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {facilityList.map((facility) => (
                            <span key={facility} className="rounded-full bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-700">{facility}</span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </section>
              ) : null}

              {aboutSections.length ? (
                <section>
                  <SectionTitle eyebrow="About" title="About this property" />
                  <div className="mt-6 space-y-4">
                    {aboutSections.map((section) => (
                      <article key={section.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-xl font-semibold text-slate-900">{section.title}</h3>
                        <p className="mt-3 text-lg leading-8 text-slate-600">{section.body}</p>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              {guesthouse.nearbyAttractions.length ? (
                <section>
                  <SectionTitle eyebrow="Nearby" title="Nearby attractions" />
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {guesthouse.nearbyAttractions.map((attraction) => (
                      <article key={attraction.name} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">{attraction.distance}</p>
                        <h3 className="mt-3 text-xl font-semibold text-slate-900">{attraction.name}</h3>
                        <p className="mt-3 text-slate-600">{attraction.description}</p>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>

            <div className="space-y-8">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Direct booking</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">Reserve your stay</h2>
                <p className="mt-3 text-slate-600">Message the property directly for availability, room options, and tailored pricing.</p>
                <div className="mt-6 space-y-3">
                  <a href={bookingLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center rounded-full bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700">
                    Reserve on WhatsApp
                  </a>
                  {directBookingUrl ? <a href={directBookingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 px-5 py-3 font-semibold text-cyan-700 transition hover:border-cyan-500 hover:bg-cyan-100">Book direct</a> : null}
                  {guesthouse.email ? <a href={`mailto:${guesthouse.email}`} className="flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-800 transition hover:border-cyan-700 hover:text-cyan-700">Email {guesthouse.email}</a> : null}
                  {guesthouse.website ? <a href={guesthouse.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-800 transition hover:border-cyan-700 hover:text-cyan-700">Visit website</a> : null}
                </div>
                {contactItems.length ? (
                  <div className="mt-6 space-y-3">
                    {contactItems.map((item) => (
                      <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-sm font-semibold text-slate-500">{item.label}</p>
                        {item.href ? (
                          <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined} className="mt-1 block break-all font-semibold text-slate-900 hover:text-cyan-700">
                            {item.value}
                          </a>
                        ) : (
                          <p className="mt-1 break-all font-semibold text-slate-900">{item.value}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Stay rules</p>
                <div className="mt-4 space-y-4">
                  {guesthouse.checkIn ? <div><p className="text-sm font-semibold text-slate-500">Check-in</p><p className="mt-1 font-semibold text-slate-900">{guesthouse.checkIn}</p></div> : null}
                  {guesthouse.checkOut ? <div><p className="text-sm font-semibold text-slate-500">Check-out</p><p className="mt-1 font-semibold text-slate-900">{guesthouse.checkOut}</p></div> : null}
                  {guesthouse.about.find((section) => section.title === "Policies")?.body ? <div><p className="text-sm font-semibold text-slate-500">Policies</p><p className="mt-1 text-slate-600">{guesthouse.about.find((section) => section.title === "Policies")?.body}</p></div> : null}
                </div>
              </div>

              <section>
                <PropertyMapPlaceholder guesthouse={guesthouse} />
                {guesthouse.mapUrl ? (
                  <a href={guesthouse.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-800">
                    Open map & directions
                  </a>
                ) : null}
              </section>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-12">
        <Container>
          <BookingWidget
            propertyId={guesthouse.id}
            propertyName={guesthouse.name}
            propertySlug={guesthouse.slug}
            turnstileSiteKey={turnstileSiteKey}
            rooms={bookingRooms}
            optionalServices={(guesthouse.services ?? []).map((service) => ({
              id: service.id,
              name: service.name,
              price: service.price,
              type: service.name.toLowerCase().includes("transfer") ? "transfer" : "custom"
            }))}
            whatsapp={guesthouse.whatsapp}
            availability={guesthouse.availability}
          />
        </Container>
      </section>
    </main>
  );
}
