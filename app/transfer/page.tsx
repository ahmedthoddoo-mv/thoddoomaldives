export default function TransferPage() {
  const options = [
    {
      title: "Public Speedboat",
      icon: "🚤",
      duration: "Around 1 hour 15 minutes",
      price: "From USD 35 per person",
      details: [
        "Most popular transfer option",
        "Departure from Malé / Velana Airport",
        "Fast and comfortable",
        "Advance booking recommended",
      ],
    },
    {
      title: "Private Speedboat",
      icon: "🛥️",
      duration: "Around 1 hour",
      price: "Price on request",
      details: [
        "Private charter",
        "Flexible departure time",
        "Airport pickup available",
        "Perfect for families and groups",
      ],
    },
    {
      title: "Public Ferry",
      icon: "⛴️",
      duration: "Around 4–5 hours",
      price: "Budget Friendly",
      details: [
        "Lowest cost option",
        "Limited operating days",
        "Longer journey",
        "Good for flexible travellers",
      ],
    },
    {
      title: "Seaplane Transfer",
      icon: "✈️",
      duration: "Approximately 15 minutes",
      price: "USD 90 per person (one way)*",
      details: [
        "Fastest way to reach Thoddoo",
        "Departure from Malé Seaplane Terminal",
        "Approximate departure: 3:45 PM",
        "Approximate return: 4:30 PM",
        "Currently operates on selected days",
        "Subject to weather and airline schedule",
        "Advance booking required",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Hero */}
      <section
        className="relative flex min-h-[65vh] items-center bg-cover bg-center px-6 text-white md:px-12"
        style={{
          backgroundImage: "url('/images/hero-thoddoo.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative z-10 max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em]">
            Airport Transfers
          </p>

          <h1 className="text-5xl font-bold md:text-7xl">
            Travel to Thoddoo
          </h1>

          <p className="mt-6 text-lg text-white/90">
            We help arrange the best transfer from Velana International Airport
            to Thoddoo Island. Choose the option that best suits your budget and
            schedule.
          </p>
        </div>
      </section>

      {/* Transfer Options */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-4xl font-bold">
          Choose Your Transfer
        </h2>

        <p className="mt-3 text-slate-600">
          We can arrange all transfer options before your arrival.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {options.map((option) => (
            <div
              key={option.title}
              className="rounded-3xl border bg-white p-8 shadow-sm transition hover:shadow-lg"
            >
              <div className="text-5xl">
                {option.icon}
              </div>

              <h3 className="mt-5 text-3xl font-bold">
                {option.title}
              </h3>

              <p className="mt-4">
                ⏱ <strong>Duration:</strong> {option.duration}
              </p>

              <p className="mt-2 text-lg font-semibold text-cyan-700">
                💰 {option.price}
              </p>

              <ul className="mt-6 space-y-3 text-slate-600">
                {option.details.map((detail) => (
                  <li key={detail}>
                    ✅ {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Important Notice */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-3xl font-bold">
            Before You Travel
          </h2>

          <div className="mt-6 rounded-3xl border bg-white p-8 shadow-sm">
            <ul className="space-y-4 text-slate-700">
              <li>✅ Please send your flight details before arrival.</li>
              <li>✅ We will recommend the best transfer based on your landing time.</li>
              <li>✅ Transfer schedules may change due to weather conditions.</li>
              <li>✅ Seaplane flights operate only during daylight hours.</li>
              <li>✅ Advance booking is highly recommended.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl font-bold">
            Need Help Arranging Your Transfer?
          </h2>

          <p className="mt-5 text-lg text-white/80">
            Send us your arrival date, flight number and number of guests.
            We&apos;ll recommend the best transfer option and arrange everything for you.
          </p>

          <a
            href="https://wa.me/9609142538?text=Hi%20I%20need%20help%20arranging%20my%20transfer%20to%20Thoddoo"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-full bg-green-500 px-8 py-4 text-lg font-semibold text-white hover:bg-green-600"
          >
            Book Transfer via WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}
