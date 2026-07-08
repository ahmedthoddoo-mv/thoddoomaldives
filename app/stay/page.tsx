import type { Metadata } from "next";
import Link from "next/link";
import { guesthouses } from "@/data/guesthouses";

export const metadata: Metadata = {
  title: "Guesthouses in Thoddoo | iThoddoo Maldives",
  description:
    "Browse guesthouses in Thoddoo, Maldives with rooms, amenities, location details, and easy WhatsApp booking.",
};

export default function StayPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section
        className="relative flex min-h-[65vh] items-center bg-cover bg-center px-6 text-white md:px-12"
        style={{
          backgroundImage:
            "linear-gradient(rgb(0 0 0 / 0.55), rgb(0 0 0 / 0.55)), url('/images/hero-thoddoo.jpg')",
        }}
      >
        <div className="relative z-10 max-w-4xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em]">
            Stay in Thoddoo
          </p>
          <h1 className="text-5xl font-bold leading-tight md:text-7xl">
            Thoddoo Guesthouses
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/90">
            Browse local island stays with room details, amenities, beach
            access, and direct WhatsApp booking.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
          Properties
        </p>
        <h2 className="mt-3 text-4xl font-bold">
          Choose Your Stay
        </h2>
        <p className="mt-4 max-w-3xl text-slate-600">
          Every guesthouse page is generated from the shared property data, so
          new stays can be added without creating a custom page.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {guesthouses.map((guesthouse) => (
            <Link
              key={guesthouse.id}
              href={`/stay/${guesthouse.slug}`}
              className="group overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:shadow-lg"
            >
              <div
                className="h-80 bg-slate-200 bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(rgb(15 23 42 / 0.08), rgb(15 23 42 / 0.08)), url('${guesthouse.heroImage}')`,
                }}
              />
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">
                    {guesthouse.distanceToBeach}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                    Rating {guesthouse.rating}
                  </span>
                </div>

                <h3 className="mt-5 text-3xl font-bold group-hover:text-cyan-700">
                  {guesthouse.name}
                </h3>
                <p className="mt-3 text-slate-600">{guesthouse.tagline}</p>
                <p className="mt-5 font-semibold text-slate-900">
                  View rooms and amenities
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
