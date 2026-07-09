import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "About Thoddoo Maldives",
  description:
    "Learn why Thoddoo is known for beaches, snorkeling, agriculture, local cafes, guesthouses, and peaceful Maldives island life.",
  path: "/about",
  image: "/images/homepage/hero-1.jpg",
});

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section
        className="relative flex min-h-[60vh] items-center bg-cover bg-center px-6 text-white md:px-12"
        style={{ backgroundImage: "url('/images/homepage/hero-1.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em]">
            About Thoddoo
          </p>
          <h1 className="text-5xl font-bold md:text-7xl">
            Real Local Island Maldives
          </h1>
          <p className="mt-6 text-lg text-white/90">
            Thoddoo is known for beaches, snorkeling, agriculture, local culture,
            and peaceful island life.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-4xl font-bold">Why Thoddoo is Special</h2>
        <p className="mt-5 text-lg text-slate-600">
          Thoddoo offers a beautiful mix of beach holidays and real Maldivian
          local island life. Visitors can enjoy bikini beach, snorkeling,
          excursions, fresh fruits, cafés, guesthouses, and friendly island
          hospitality.
        </p>
      </section>
    </main>
  );
}
