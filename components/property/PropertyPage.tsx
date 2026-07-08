import BookButton from "@/components/BookButton";
import BookingInquiryForm from "@/components/BookingInquiryForm";
import PropertyAmenities from "@/components/property/PropertyAmenities";
import PropertyRoomCard from "@/components/property/PropertyRoomCard";
import Badge from "@/components/ui/Badge";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import type { Guesthouse } from "@/types/guesthouse";

export default function PropertyPage({
  guesthouse,
}: {
  guesthouse: Guesthouse;
}) {
  const galleryImages = guesthouse.gallery.filter(Boolean);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section
        className="relative flex min-h-[70vh] items-center bg-cover bg-center px-6 text-white md:px-12"
        style={{
          backgroundImage: `linear-gradient(rgb(0 0 0 / 0.55), rgb(0 0 0 / 0.55)), url('${guesthouse.heroImage}')`,
        }}
      >
        <div className="relative z-10 max-w-4xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em]">
            Featured Guesthouse
          </p>

          <h1 className="text-5xl font-bold leading-tight md:text-7xl">
            {guesthouse.name}
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-white/90">
            {guesthouse.tagline}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
              {guesthouse.location}
            </span>
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
              {guesthouse.distanceToBeach}
            </span>
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
              Rating {guesthouse.rating}
            </span>
          </div>

          <div className="mt-8">
            <BookButton phone={guesthouse.whatsapp} name={guesthouse.name} />
          </div>
        </div>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <Badge>Stay in Thoddoo</Badge>
              <h2 className="mt-4 text-4xl font-bold">
                {guesthouse.tagline}
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                {guesthouse.description}
              </p>
            </div>

            <div className="rounded-3xl border bg-slate-50 p-8">
              <h3 className="text-2xl font-bold">Property Details</h3>
              <dl className="mt-6 space-y-4 text-slate-700">
                <div>
                  <dt className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                    Location
                  </dt>
                  <dd className="mt-1 text-lg">{guesthouse.location}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                    Beach Access
                  </dt>
                  <dd className="mt-1 text-lg">{guesthouse.distanceToBeach}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                    Rating
                  </dt>
                  <dd className="mt-1 text-lg">{guesthouse.rating}</dd>
                </div>
              </dl>
            </div>
          </div>
        </Container>
      </section>

      {galleryImages.length > 0 && (
        <section className="bg-slate-50 py-16">
          <Container>
            <SectionTitle eyebrow="Gallery" title={`Photos of ${guesthouse.name}`} />

            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {galleryImages.map((image, index) => (
                <div
                  key={image}
                  className={`min-h-64 rounded-3xl bg-slate-200 bg-cover bg-center ${
                    index === 0 ? "md:col-span-2 md:row-span-2" : ""
                  }`}
                  style={{
                    backgroundImage: `linear-gradient(rgb(15 23 42 / 0.08), rgb(15 23 42 / 0.08)), url('${image}')`,
                  }}
                  role="img"
                  aria-label={`${guesthouse.name} photo ${index + 1}`}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="py-16">
        <Container>
          <SectionTitle eyebrow="Rooms" title="Rooms and Prices" />

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {guesthouse.rooms.map((room) => (
              <PropertyRoomCard
                key={room.name}
                room={room}
                guesthouseName={guesthouse.name}
                whatsapp={guesthouse.whatsapp}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-slate-50 py-16">
        <Container>
          <SectionTitle eyebrow="Amenities" title="What is included" />

          <div className="mt-8">
            <PropertyAmenities amenities={guesthouse.amenities} />
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <BookingInquiryForm />
        </Container>
      </section>
    </main>
  );
}
