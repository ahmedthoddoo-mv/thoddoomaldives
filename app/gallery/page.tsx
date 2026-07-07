export default function GalleryPage() {
  const photos = [
    "/images/homepage/hero-1.jpg",
    "/images/homepage/hero-2.jpg",
    "/images/homepage/hero-3.jpg",
    "/images/homepage/hero-4.jpg",
    "/images/homepage/hero-5.jpg",
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section
        className="relative flex min-h-[60vh] items-center bg-cover bg-center px-6 text-white md:px-12"
        style={{ backgroundImage: "url('/images/homepage/hero-3.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em]">
            Thoddoo Gallery
          </p>

          <h1 className="text-5xl font-bold md:text-7xl">
            See the Beauty of Thoddoo
          </h1>

          <p className="mt-6 text-lg text-white/90">
            Beaches, island life, excursions, farms, and real local Maldives moments.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-4xl font-bold">Photo Gallery</h2>
        <p className="mt-3 text-slate-600">
          A first look at Thoddoo before you arrive.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => (
            <div
              key={photo}
              className="h-80 rounded-3xl bg-cover bg-center shadow-sm"
              style={{ backgroundImage: `url('${photo}')` }}
              aria-label={`Thoddoo gallery photo ${index + 1}`}
            />
          ))}
        </div>
      </section>
    </main>
  );
}