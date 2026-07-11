import type { Metadata } from "next";
import Link from "next/link";
import { PropertyRepository } from "@/lib/repositories";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Guesthouses in Thoddoo Maldives",
  description:
    "Browse Thoddoo guesthouses with room details, amenities, beach access, local support, and direct WhatsApp booking.",
  path: "/stay",
  image: "/images/hero-thoddoo.jpg",
});

export default function StayPage() {
  const guesthouses = PropertyRepository.findPublicAll();

  return (
    <main className="platformPage">
      <section
        className="platformHero"
        style={{
          backgroundImage: "url('/images/hero-thoddoo.jpg')",
        }}
      >
        <div className="platformHeroInner">
          <p className="eyebrow">Stay in Thoddoo</p>
          <h1>Thoddoo Guesthouses</h1>
          <p>
            Browse local island stays with room details, amenities, beach
            access, and direct WhatsApp booking.
          </p>
        </div>
      </section>

      <section className="platformSection">
        <div className="platformContainer">
          <div className="platformSectionHeader">
            <p className="eyebrow">Properties</p>
            <h2>Choose Your Stay</h2>
            <p>
              Every guesthouse page is generated from the shared property data, so
              new stays can be added without creating a custom page.
            </p>
          </div>

          <div className="platformGrid platformGridTwo">
            {guesthouses.map((guesthouse) => (
              <Link key={guesthouse.id} href={`/stay/${guesthouse.slug}`} className="platformCard">
                <div
                  className="platformCardImage"
                  style={{ backgroundImage: `url('${guesthouse.heroImage}')` }}
                />
                <div className="platformCardBody">
                  <div className="platformPillRow">
                    <span className="platformPill">{guesthouse.distanceToBeach}</span>
                    <span className="platformPill">Rating {guesthouse.rating}</span>
                  </div>

                  <h3>{guesthouse.name}</h3>
                  <p>{guesthouse.tagline}</p>
                  <p className="font-semibold text-slate-900">View rooms and amenities</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
