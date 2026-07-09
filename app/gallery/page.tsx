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
    <main className="platformPage">
      <section
        className="platformHero"
        style={{ backgroundImage: "url('/images/hero-thoddoo.jpg')" }}
      >
        <div className="platformHeroInner">
          <p className="eyebrow">Thoddoo Gallery</p>
          <h1>See the Beauty of Thoddoo</h1>
          <p>
            Beaches, island life, excursions, farms, and real local Maldives moments.
          </p>
        </div>
      </section>

      <section className="platformSection">
        <div className="platformContainer">
          <div className="platformSectionHeader">
            <p className="eyebrow">Gallery</p>
            <h2>Photo Gallery</h2>
            <p>A first look at Thoddoo before you arrive.</p>
          </div>

          <div className="platformGrid platformGridThree">
            {photos.map((photo, index) => (
              <div
                key={photo}
                className="platformCard relative h-80"
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
        </div>
      </section>
    </main>
  );
}
