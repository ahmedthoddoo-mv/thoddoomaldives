export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section
        className="relative flex min-h-[60vh] items-center bg-cover bg-center px-6 text-white md:px-12"
        style={{ backgroundImage: "url('/images/homepage/hero-4.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em]">
            Contact
          </p>
          <h1 className="text-5xl font-bold md:text-7xl">
            Plan Your Thoddoo Trip
          </h1>
          <p className="mt-6 text-lg text-white/90">
            Message us for stays, transfers, excursions, and local island help.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          <a
            href="https://wa.me/9609142538?text=Hi%20I%20want%20to%20plan%20a%20trip%20to%20Thoddoo"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-3xl bg-green-500 p-8 text-white shadow-sm"
          >
            <h2 className="text-3xl font-bold">WhatsApp</h2>
            <p className="mt-3">Fastest way to contact us.</p>
            <p className="mt-5 font-semibold">+960 914 2538</p>
          </a>

          <div className="rounded-3xl border p-8 shadow-sm">
            <h2 className="text-3xl font-bold">iThoddoo Maldives</h2>
            <p className="mt-3 text-slate-600">
              Local travel help for Thoddoo guesthouses, transfers, excursions,
              and island information.
            </p>
            <p className="mt-5">📍 Thoddoo, Maldives</p>
          </div>
        </div>
      </section>
    </main>
  );
}