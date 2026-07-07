export default function GuidePage() {
  const guides = [
    ["🏖️", "Bikini Beach", "Where tourists can swim and relax."],
    ["💵", "Money & ATM", "Bring cash; check ATM availability before arrival."],
    ["🍽️", "Restaurants", "Local cafés, seafood, Maldivian food, and snacks."],
    ["🚤", "Transfers", "Speedboat, ferry, private boat, and seaplane options."],
    ["👕", "Dress Code", "Respect local island culture outside bikini beach."],
    ["🌦️", "Best Time to Visit", "Sunny season is popular, but Thoddoo is beautiful year-round."],
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section
        className="relative flex min-h-[60vh] items-center bg-cover bg-center px-6 text-white md:px-12"
        style={{ backgroundImage: "url('/images/homepage/hero-5.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em]">
            Travel Guide
          </p>
          <h1 className="text-5xl font-bold md:text-7xl">
            Thoddoo Travel Guide
          </h1>
          <p className="mt-6 text-lg text-white/90">
            Useful island information before you arrive in Thoddoo.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {guides.map(([icon, title, desc]) => (
            <div key={title} className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="text-4xl">{icon}</div>
              <h2 className="mt-4 text-2xl font-bold">{title}</h2>
              <p className="mt-3 text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}