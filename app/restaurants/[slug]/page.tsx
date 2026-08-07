/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MediaGallery from "@/components/media/MediaGallery";
import RestaurantMenuViewer from "@/components/restaurant/RestaurantMenuViewer";
import { mediaItemsFromUrls } from "@/lib/business-media/public";
import { getLivePublishedRestaurantBySlug } from "@/lib/repositories/liveReads";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type RestaurantDetailPageProps = {
  params: Promise<{ slug: string }>;
};

async function readRestaurant(slug: string) {
  const result = await getLivePublishedRestaurantBySlug(slug);
  return result.data;
}

export async function generateMetadata({ params }: RestaurantDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await readRestaurant(slug);

  if (!restaurant) {
    return {
      title: "Restaurant Not Found",
      robots: { index: false, follow: false }
    };
  }

  const description =
    restaurant.description.trim()
    || `${restaurant.name} restaurant in Thoddoo, Maldives`;

  return {
    ...createPageMetadata({
      title: restaurant.name,
      description,
      path: `/restaurants/${restaurant.slug}`,
      image: restaurant.image
    }),
    robots: { index: true, follow: true }
  };
}

export default async function RestaurantDetailPage({ params }: RestaurantDetailPageProps) {
  const { slug } = await params;
  const restaurant = await readRestaurant(slug);
  if (!restaurant) {
    notFound();
  }

  // Separate media by purpose: menu items vs gallery photos
  const allMedia = restaurant.media ?? [];
  const menuItems = allMedia.filter((item) => item.mediaPurpose === "menu");
  const galleryItems = allMedia.filter((item) => item.mediaPurpose !== "menu");

  // Fall back to legacy URLs if no business_media records exist yet
  const publicGalleryItems = galleryItems.length > 0
    ? galleryItems
    : mediaItemsFromUrls(
        restaurant.gallery && restaurant.gallery.length > 0
          ? restaurant.gallery
          : [restaurant.image].filter(Boolean),
        restaurant.name,
        "restaurant",
        restaurant.id
      );

  const featuredMedia = allMedia.find((item) => item.isFeatured) ?? null;

  const detailItems = [
    restaurant.cuisine.length > 0 ? { label: "Cuisine", value: restaurant.cuisine.join(", ") } : null,
    restaurant.priceRange ? { label: "Price range", value: restaurant.priceRange } : null,
    restaurant.openingHours ? { label: "Opening hours", value: restaurant.openingHours } : null,
    restaurant.location ? { label: "Area", value: restaurant.location } : null
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const hasContact = !!(restaurant.phone || restaurant.email || restaurant.website || restaurant.instagram || restaurant.facebook);
  const hasAddress = !!(restaurant.address);
  const hasMap = !!(restaurant.latitude && restaurant.longitude);

  return (
    <main className="platformPage">
      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section
        className="platformHero"
        style={{ backgroundImage: `linear-gradient(rgba(2, 6, 23, 0.5), rgba(2, 6, 23, 0.65)), url('${restaurant.image}')` }}
      >
        <div className="platformHeroInner">
          <Link
            href="/restaurants"
            className="inline-flex rounded-full border border-white/35 px-4 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            ← Back to Restaurants
          </Link>
          <p className="eyebrow mt-6">Restaurant · Thoddoo, Maldives</p>
          <h1>{restaurant.name}</h1>
          {restaurant.location ? <p className="mt-2 text-lg text-white/80">{restaurant.location}</p> : null}
          {restaurant.cuisine.length > 0 ? (
            <div className="platformPillRow mt-6">
              {restaurant.cuisine.map((cuisine) => (
                <span key={cuisine} className="platformPill bg-white/15 text-white">
                  {cuisine}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* ─── ABOUT + DETAILS ──────────────────────────────────────────── */}
      <section className="platformSection">
        <div className="platformContainer">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
            <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <p className="eyebrow">Overview</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">About {restaurant.name}</h2>
              {restaurant.description ? (
                <p className="mt-5 whitespace-pre-line text-base leading-8 text-slate-700">
                  {restaurant.description}
                </p>
              ) : (
                <p className="mt-5 text-base leading-8 text-slate-600">
                  Detailed description has not been added yet.
                </p>
              )}

              {featuredMedia ? (
                <figure className="mt-8 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-100">
                  <img
                    src={featuredMedia.url}
                    alt={featuredMedia.altText || restaurant.name}
                    className="h-[320px] w-full object-cover"
                  />
                  {featuredMedia.caption ? (
                    <figcaption className="border-t border-slate-200 px-5 py-4 text-sm text-slate-600">
                      {featuredMedia.caption}
                    </figcaption>
                  ) : null}
                </figure>
              ) : null}
            </article>

            {detailItems.length > 0 ? (
              <aside className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <p className="eyebrow">Restaurant details</p>
                <dl className="mt-5 space-y-5">
                  {detailItems.map((item) => (
                    <div key={item.label}>
                      <dt className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</dt>
                      <dd className="mt-2 text-base font-medium text-slate-900">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </aside>
            ) : null}
          </div>
        </div>
      </section>

      {/* ─── CONTACT & LOCATION ───────────────────────────────────────── */}
      {(hasContact || hasAddress) ? (
        <section className="platformSection pt-0">
          <div className="platformContainer">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <p className="eyebrow">Contact & Location</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">Find us</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {restaurant.phone ? (
                  <a
                    href={`tel:${restaurant.phone.replace(/\s+/g, "")}`}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 px-5 py-4 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    <span className="text-2xl" aria-hidden="true">📞</span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Phone</p>
                      <p className="mt-0.5 font-semibold text-slate-900">{restaurant.phone}</p>
                    </div>
                  </a>
                ) : null}
                {restaurant.whatsapp ? (
                  <a
                    href={`https://wa.me/${restaurant.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-5 py-4 transition hover:border-emerald-400"
                  >
                    <span className="text-2xl" aria-hidden="true">💬</span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">WhatsApp</p>
                      <p className="mt-0.5 font-semibold text-slate-900">{restaurant.whatsapp}</p>
                    </div>
                  </a>
                ) : null}
                {restaurant.email ? (
                  <a
                    href={`mailto:${restaurant.email}`}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 px-5 py-4 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    <span className="text-2xl" aria-hidden="true">✉️</span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email</p>
                      <p className="mt-0.5 font-semibold text-slate-900">{restaurant.email}</p>
                    </div>
                  </a>
                ) : null}
                {restaurant.website ? (
                  <a
                    href={restaurant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 px-5 py-4 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    <span className="text-2xl" aria-hidden="true">🌐</span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Website</p>
                      <p className="mt-0.5 font-semibold text-slate-900">{restaurant.website}</p>
                    </div>
                  </a>
                ) : null}
                {restaurant.instagram ? (
                  <a
                    href={`https://instagram.com/${restaurant.instagram.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 px-5 py-4 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    <span className="text-2xl" aria-hidden="true">📸</span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Instagram</p>
                      <p className="mt-0.5 font-semibold text-slate-900">@{restaurant.instagram.replace(/^@/, "")}</p>
                    </div>
                  </a>
                ) : null}
                {restaurant.facebook ? (
                  <a
                    href={restaurant.facebook.startsWith("http") ? restaurant.facebook : `https://facebook.com/${restaurant.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 px-5 py-4 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    <span className="text-2xl" aria-hidden="true">📘</span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Facebook</p>
                      <p className="mt-0.5 font-semibold text-slate-900">{restaurant.facebook}</p>
                    </div>
                  </a>
                ) : null}
              </div>

              {hasAddress ? (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Address</p>
                  <p className="mt-2 text-base font-medium text-slate-900">{restaurant.address}</p>
                  {hasMap ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Get directions →
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* ─── MENU ─────────────────────────────────────────────────────── */}
      {menuItems.length > 0 ? (
        <section className="platformSection pt-0">
          <div className="platformContainer">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <p className="eyebrow">Food & Drinks</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">Menu</h2>
              <p className="mt-2 text-sm text-slate-600">
                Tap any page to view full size. Use the arrows to navigate between pages.
              </p>
              <div className="mt-6">
                <RestaurantMenuViewer items={menuItems} restaurantName={restaurant.name} />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ─── PHOTO GALLERY ────────────────────────────────────────────── */}
      {publicGalleryItems.length > 0 ? (
        <section className="platformSection pt-0">
          <div className="platformContainer">
            <MediaGallery
              mode="public"
              businessName={restaurant.name}
              items={publicGalleryItems}
              title="Photo gallery"
              description="Browse the restaurant photo gallery."
            />
          </div>
        </section>
      ) : null}

      {/* ─── BACK LINK ────────────────────────────────────────────────── */}
      <section className="platformSection pt-0 pb-16">
        <div className="platformContainer">
          <Link
            href="/restaurants"
            className="inline-flex rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-950 hover:bg-slate-950 hover:text-white"
          >
            ← All restaurants
          </Link>
        </div>
      </section>
    </main>
  );
}
