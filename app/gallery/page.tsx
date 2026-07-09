import type { Metadata } from "next";
import Image from "next/image";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Thoddoo Photo Gallery",
  description:
    "See temporary Thoddoo Maldives gallery images featuring beaches, island scenery, reef life, and local island moments.",
  path: "/gallery",
  image: "/images/hero-thoddoo.jpg",
});

export default function GalleryPage() {
  const photos = [
    "/images/hero-thoddoo.jpg",
    "/images/homepage/hero-1.jpg",
    "/images/homepage/hero-4.jpg",
    "/images/homepage/hero-6.jpg",
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
              className="relative h-80 overflow-hidden rounded-3xl bg-slate-100 shadow-sm"
              aria-label={`Thoddoo gallery photo ${index + 1}`}
            >
              <Image
                src={photo}
                alt={`Thoddoo gallery photo ${index + 1}`}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
