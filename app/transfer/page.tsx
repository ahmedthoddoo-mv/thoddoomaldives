export default function TransferPage() {
  const options = [
    {
      title: "Public Speedboat",
      icon: "🚤",
      duration: "Around 1 hour 15 minutes",
      price: "From $35 per person",
      details: [
        "Most popular option for tourists",
        "Airport / Malé departure",
        "Daily schedules may change by season",
        "Advance booking recommended",
      ],
    },
    {
      title: "Private Speedboat",
      icon: "🛥️",
      duration: "Around 1 hour",
      price: "On request",
      details: [
        "Best for families and groups",
        "Flexible timing",
        "Direct airport pickup available",
        "Higher price but more convenient",
      ],
    },
    {
      title: "Public Ferry",
      icon: "⛴️",
      duration: "Around 4–5 hours",
      price: "Budget option",
      details: [
        "Cheapest option",
        "Limited schedule",
        "Not available every day",
        "Better for flexible travelers",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section
        className="relative flex min-h-[60vh] items-center bg-cover bg-center px-6 text-white md:px-12"
        style={{ backgroundImage: "url('/images/homepage/hero-2.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em]">
            Airport to Thoddoo
          </p>
          <h1 className="text-5xl font-bold md:text-7xl">
            Transfer to Thoddoo
          </h1>
          <p className="mt-6 text-lg text-white/90">
            Find the easiest way to reach Thoddoo from Malé Airport by speedboat,
            private boat, or public ferry.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-4xl font-bold">Transfer Options</h2>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {options.map((option) => (
            <div key={option.title} className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="text-5xl">{option.icon}</div>
              <h3 className="mt-4 text-2xl font-bold">{option.title}</h3>
              <p className="mt-3 text-slate-600">⏱️ {option.duration}</p>
              <p className="mt-2 font-semibold text-slate-900">💰 {option.price}</p>

              <ul className="mt-5 space-y-2 text-sm text-slate-600">
                {option.details.map((detail) => (
                  <li key={detail}>✅ {detail}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-3xl bg-slate-950 p-8 text-white">
          <h2 className="text-3xl font-bold">Need help booking your transfer?</h2>
          <p className="mt-4 max-w-2xl text-white/70">
            Send us your arrival date, flight time, number of guests, and we’ll
            help you choose the best transfer option to Thoddoo.
          </p>

          <a
            href="https://wa.me/9609142538?text=Hi%20I%20want%20to%20book%20transfer%20to%20Thoddoo"
            target="_blank"
            className="mt-6 inline-block rounded-full bg-green-500 px-6 py-3 font-semibold text-white"
          >
            Book Transfer on WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}