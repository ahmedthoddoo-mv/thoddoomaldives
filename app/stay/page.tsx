import type { Metadata } from "next";
import { StayDirectoryClient } from "@/components/property/StayDirectoryClient";
import { getPublishedStayProperties } from "@/lib/properties/propertyReads";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Guesthouses in Thoddoo Maldives",
  description:
    "Browse Thoddoo guesthouses with room details, amenities, beach access, local support, and direct WhatsApp booking.",
  path: "/stay",
  image: "/images/hero-thoddoo.jpg",
});

export default async function StayPage() {
  const stayProperties = await getPublishedStayProperties();

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

          <StayDirectoryClient
            initialGuesthouses={stayProperties.data}
            readSource={stayProperties.source}
            error={stayProperties.error}
          />
        </div>
      </section>
    </main>
  );
}
