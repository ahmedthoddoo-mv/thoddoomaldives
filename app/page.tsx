import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  const heroImages = [
    "/images/homepage/hero-1.jpg",
    "/images/homepage/hero-2.jpg",
    "/images/homepage/hero-3.jpg",
    "/images/homepage/hero-4.jpg",
    "/images/homepage/hero-5.jpg",
  ];

  const experiences = [
    ["🐢", "Turtle Snorkeling", "Swim with turtles and explore Thoddoo reefs."],
    ["🏝️", "Sandbank Trip", "Visit beautiful sandbanks with crystal-clear water."],
    ["🎣", "Fishing Trips", "Sunset fishing and local-style fishing adventures."],
    ["🍉", "Watermelon Farms", "Discover Thoddoo’s famous agricultural side."],
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <section
        className="relative flex min-h-screen items-center bg-cover bg-center px-6 text-white md:px-12"
        style={{ backgroundImage: `url('${heroImages[0]}')` }}
      >
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 max-w-4xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em]">
            Local Island Maldives
          </p>

          <h1 className="text-5xl font-bold leading-tight md:text-7xl">
            Discover the Real Maldives in Thoddoo
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-white/90">
            Plan your stay, book island experiences, arrange transfers, and
            explore Thoddoo with trusted local guidance.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/stay"
              className="rounded-full bg-white px-6 py-3 font-semibold text-slate-900"
            >
              Book Your Stay
            </a>

            <a
              href="/experiences"
              className="rounded-full border border-white px-6 py-3 font-semibold text-white"
            >
              Explore Experiences
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
          Photo Gallery
        </p>
        <h2 className="mt-3 text-4xl font-bold">
          See Thoddoo Before You Arrive
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-5">
          {heroImages.map((image, index) => (
            <div
              key={image}
              className="h-64 rounded-3xl bg-cover bg-center shadow-sm"
              style={{ backgroundImage: `url('${image}')` }}
              aria-label={`Thoddoo photo ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
          Why Thoddoo
        </p>

        <h2 className="mt-3 text-4xl font-bold">
          Beaches, turtles, farms, and real island life.
        </h2>

        <p className="mt-5 max-w-3xl text-slate-600">
          Thoddoo is one of the Maldives’ most beautiful local islands, known
          for white sandy beaches, turquoise lagoons, snorkeling, friendly island
          life, and famous watermelon farms.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            "🏖️ Beautiful Bikini Beach",
            "🐢 Turtle snorkeling areas",
            "🍉 Famous watermelon farms",
            "🚤 Easy speedboat transfers",
            "🏨 Local guesthouse stays",
            "🤿 Local island experiences",
          ].map((item) => (
            <div key={item} className="rounded-2xl border bg-white p-5 font-medium">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
            Featured Stay
          </p>

          <h2 className="mt-3 text-4xl font-bold">Thoddoo Sun Sky Inn</h2>

          <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm md:grid md:grid-cols-2">
            <div
              className="min-h-[320px] bg-cover bg-center"
              style={{ backgroundImage: "url('/images/homepage/hero-2.jpg')" }}
            />

            <div className="p-6 md:p-10">
              <h3 className="text-3xl font-bold">Stay close to island life</h3>

              <p className="mt-4 text-slate-600">
                Comfortable rooms with breakfast, Wi-Fi, air conditioning,
                private bathroom, hot water, bicycle rental, and transfer help.
              </p>

              <div className="mt-6 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
                <p>✅ Deluxe Double Room — $85</p>
                <p>✅ Family Room — $110</p>
                <p>✅ Breakfast included</p>
                <p>✅ WhatsApp booking</p>
              </div>

              <a
                href="/stay"
                className="mt-8 inline-block rounded-full bg-slate-900 px-6 py-3 font-semibold text-white"
              >
                View Rooms
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
          Island Experiences
        </p>

        <h2 className="mt-3 text-4xl font-bold">Things to do in Thoddoo</h2>

        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {experiences.map(([icon, title, desc]) => (
            <div key={title} className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="text-4xl">{icon}</div>
              <h3 className="mt-4 text-xl font-bold">{title}</h3>
              <p className="mt-3 text-sm text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  );
}