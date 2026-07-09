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
    <main className="platformPage">
      <section
        className="platformHero"
        style={{ backgroundImage: "url('/images/homepage/hero-1.jpg')" }}
      >
        <div className="platformHeroInner">
          <p className="eyebrow">About Thoddoo</p>
          <h1>Real Local Island Maldives</h1>
          <p>
            Thoddoo is known for beaches, snorkeling, agriculture, local culture,
            and peaceful island life.
          </p>
        </div>
      </section>

      <section className="platformSection">
        <div className="platformContainer">
          <div className="platformSectionHeader">
            <p className="eyebrow">Island story</p>
            <h2>Why Thoddoo is Special</h2>
            <p>
              Thoddoo offers a beautiful mix of beach holidays and real Maldivian
              local island life. Visitors can enjoy bikini beach, snorkeling,
              excursions, fresh fruits, cafés, guesthouses, and friendly island
              hospitality.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
