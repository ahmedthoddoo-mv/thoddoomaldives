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
      <nav className="absolute top-0 z-20 flex w-full items-center justify-between px-6 py-5 text-white md:px-12">
        <a href="/" className="text-xl font-bold">iThoddoo Maldives</a>

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
            <a href="/stay" className="rounded-full bg-white px-6 py-3 font-semibold text-slate-900">
              Book Your Stay
            </a>
            <a href="/experiences" className="rounded-full border border-white px-6 py-3 font-semibold text-white">
              Explore Experiences
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
          Photo Gallery
        </p>
        <h2 className="mt-3 text-4xl font-bold">See Thoddoo Before You Arrive</h2>

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

      {/* keep the rest of your sections below this if you want */}
    </main>
  );
}