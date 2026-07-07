export default function Home() {
  const experiences = [
    ["🐢", "Turtle Snorkeling", "Swim with turtles and explore Thoddoo reefs."],
    ["🏝️", "Sandbank Trip", "Visit beautiful sandbanks with crystal-clear water."],
    ["🎣", "Fishing Trips", "Sunset fishing and local-style fishing adventures."],
    ["🍉", "Watermelon Farms", "Discover Thoddoo’s famous agricultural side."],
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <nav className="absolute top-0 z-20 flex w-full items-center justify-between px-6 py-5 text-white md:px-12">
        <a href="/" className="text-xl font-bold">
          iThoddoo Maldives
        </a>

        <div className="hidden gap-6 text-sm font-medium md:flex">
          <a href="/">Home</a>
          <a href="/stay">Stay</a>
          <a href="/experiences">Experiences</a>
          <a href="/transfer">Transfer</a>
          <a href="/guide">Travel Guide</a>
          <a href="/contact">Contact</a>
        </div>
      </nav>

      <section
        className="relative flex min-h-screen items-center bg-cover bg-center px-6 text-white md:px-12"
        style={{ backgroundImage: "url('/images/hero-thoddoo.jpg')" }}
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
        <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
              Why Thoddoo
            </p>
            <h2 className="mt-3 text-4xl font-bold">
              Beaches, turtles, farms, and real island life.
            </h2>
            <p className="mt-5 text-slate-600">
              Thoddoo is one of the Maldives’ most beautiful local islands,
              known for white sandy beaches, turquoise lagoons, snorkeling,
              friendly island life, and famous watermelon farms.
            </p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-6 shadow-sm">
            <div className="grid gap-4">
              {[
                "🏖️ Beautiful Bikini Beach",
                "🐢 Turtle snorkeling areas",
                "🍉 Famous watermelon farms",
                "🚤 Easy speedboat transfers",
                "🏨 Local guesthouse stays",
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-white p-4 font-medium">
                  {item}
                </div>
              ))}
            </div>
          </div>
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
              style={{ backgroundImage: "url('/images/hero-thoddoo.jpg')" }}
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

      <section className="bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-4xl font-bold">Ready to plan your Thoddoo trip?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">
            Message us on WhatsApp for stays, transfers, excursions, and local
            travel help.
          </p>

          <a
            href="https://wa.me/9609142538?text=Hi%20I%20want%20to%20plan%20a%20trip%20to%20Thoddoo"
            target="_blank"
            className="mt-8 inline-block rounded-full bg-green-500 px-7 py-4 font-semibold text-white"
          >
            Plan My Trip on WhatsApp
          </a>
        </div>
      </section>

      <a
        href="https://wa.me/9609142538?text=Hi%20I%20want%20to%20plan%20a%20trip%20to%20Thoddoo"
        target="_blank"
        className="fixed bottom-5 right-5 z-30 rounded-full bg-green-500 px-5 py-4 font-semibold text-white shadow-lg"
      >
        WhatsApp
      </a>
    </main>
  );
}