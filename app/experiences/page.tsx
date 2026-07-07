export default function ExperiencesPage() {
  const experiences = [
    {
      title: "Turtle Snorkeling",
      icon: "🐢",
      price: "From $35",
      duration: "2–3 hours",
      desc: "Explore Thoddoo reefs and swim near turtles with local guidance.",
    },
    {
      title: "Sandbank Trip",
      icon: "🏝️",
      price: "From $60",
      duration: "Half day",
      desc: "Visit a beautiful sandbank with crystal-clear water and photo stops.",
    },
    {
      title: "Sunset Fishing",
      icon: "🎣",
      price: "From $40",
      duration: "2–3 hours",
      desc: "Enjoy traditional Maldivian fishing during sunset.",
    },
    {
      title: "Water Sports",
      icon: "🌊",
      price: "On request",
      duration: "Flexible",
      desc: "Fun beach and lagoon activities arranged with local operators.",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section
        className="relative flex min-h-[60vh] items-center bg-cover bg-center px-6 text-white md:px-12"
        style={{ backgroundImage: "url('/images/hero-thoddoo.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em]">
            Island Experiences
          </p>
          <h1 className="text-5xl font-bold md:text-7xl">
            Things to Do in Thoddoo
          </h1>
          <p className="mt-6 text-lg text-white/90">
            Snorkeling, sandbanks, fishing, water sports, and local island adventures.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {experiences.map((item) => (
            <div key={item.title} className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="text-5xl">{item.icon}</div>
              <h2 className="mt-4 text-3xl font-bold">{item.title}</h2>
              <p className="mt-3 text-slate-600">{item.desc}</p>

              <div className="mt-5 grid gap-2 text-sm text-slate-700">
                <p>⏱️ Duration: {item.duration}</p>
                <p>💰 Price: {item.price}</p>
              </div>

              <a
                href={`https://wa.me/9609142538?text=Hi%20I%20want%20to%20book%20${encodeURIComponent(
                  item.title
                )}%20in%20Thoddoo`}
                target="_blank"
                className="mt-6 inline-block rounded-full bg-green-500 px-6 py-3 font-semibold text-white"
              >
                Book on WhatsApp
              </a>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}