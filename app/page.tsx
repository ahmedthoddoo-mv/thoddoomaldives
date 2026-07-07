export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <nav className="absolute top-0 z-20 flex w-full items-center justify-between px-6 py-5 text-white md:px-12">
        <div className="text-xl font-bold">iThoddoo Maldives</div>
        <div className="hidden gap-6 text-sm font-medium md:flex">
          <a href="/">Home</a>
          <a href="/stay">Stay</a>
          <a href="/experiences">Experiences</a>
          <a href="/transfer">Transfer</a>
          <a href="/contact">Contact</a>
        </div>
      </nav>

      <section
        className="relative flex min-h-screen items-center bg-cover bg-center px-6 text-white md:px-12"
        style={{ backgroundImage: "url('/images/hero-thoddoo.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em]">
            Local Island Paradise
          </p>

          <h1 className="text-5xl font-bold leading-tight md:text-7xl">
            Discover Thoddoo Maldives
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-white/90">
            Stay, explore, and experience Thoddoo with trusted local guidance,
            guesthouse bookings, transfers, and unforgettable island adventures.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/stay"
              className="rounded-full bg-white px-6 py-3 font-semibold text-slate-900"
            >
              Book Your Stay
            </a>

            <a
              href="https://wa.me/9609142538?text=Hi%20I%20want%20to%20plan%20a%20trip%20to%20Thoddoo"
              target="_blank"
              className="rounded-full bg-green-500 px-6 py-3 font-semibold text-white"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 text-center">
        <h2 className="text-4xl font-bold">Why Visit Thoddoo?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600">
          Thoddoo is famous for beautiful beaches, local island life,
          snorkeling, agriculture, and fresh watermelon farms.
        </p>

        <div className="mx-auto mt-10 grid max-w-6xl gap-6 md:grid-cols-4">
          {[
            ["🏖️", "Bikini Beach", "White sand and clear turquoise water"],
            ["🐢", "Snorkeling", "Reefs, turtles, and marine life"],
            ["🍉", "Watermelon Farms", "A unique agricultural island experience"],
            ["🚤", "Excursions", "Sandbanks, fishing, and island trips"],
          ].map(([icon, title, desc]) => (
            <div key={title} className="rounded-2xl border p-6 shadow-sm">
              <div className="text-3xl">{icon}</div>
              <h3 className="mt-4 text-xl font-bold">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold">Plan Everything in One Place</h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["Stay", "Find guesthouses and send booking inquiries.", "/stay"],
              ["Experiences", "Book snorkeling, sandbank, fishing, and tours.", "/experiences"],
              ["Transfers", "Check speedboat and ferry information.", "/transfer"],
            ].map(([title, desc, link]) => (
              <a key={title} href={link} className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="text-2xl font-bold">{title}</h3>
                <p className="mt-3 text-slate-600">{desc}</p>
                <p className="mt-5 font-semibold text-cyan-700">Explore →</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 px-6 py-8 text-center text-white">
        © 2026 iThoddoo Maldives — Built for island travel and bookings
      </footer>
    </main>
  );
}