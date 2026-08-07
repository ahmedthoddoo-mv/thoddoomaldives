/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MediaGallery from "@/components/media/MediaGallery";
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
    || `${restaurant.name} in Thoddoo, Maldives`;

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

function detailItems(restaurant: Awaited<ReturnType<typeof readRestaurant>>) {
  if (!restaurant) {
    return [];
  }

  return [
    restaurant.location ? { label: "Location", value: restaurant.location } : null,
    restaurant.openingHours ? { label: "Opening hours", value: restaurant.openingHours } : null,
    restaurant.priceRange ? { label: "Price range", value: restaurant.priceRange } : null,
    restaurant.cuisine.length > 0 ? { label: "Cuisine", value: restaurant.cuisine.join(", ") } : null
  ].filter(Boolean) as Array<{ label: string; value: string }>;
}

export default async function RestaurantDetailPage({ params }: RestaurantDetailPageProps) {
  const { slug } = await params;
  const restaurant = await readRestaurant(slug);
  if (!restaurant) {
    notFound();
  }

  const galleryItems = restaurant.media && restaurant.media.length > 0
    ? restaurant.media
    : mediaItemsFromUrls(
        restaurant.gallery && restaurant.gallery.length > 0 ? restaurant.gallery : [restaurant.image].filter(Boolean),
        restaurant.name,
        "restaurant",
        restaurant.id
      );
  const featuredMedia = restaurant.media?.find((item) => item.isFeatured) ?? null;
  const infoItems = detailItems(restaurant);

  return (
    <main className="platformPage">
      <section
        className="platformHero"
        style={{ backgroundImage: `linear-gradient(rgba(2, 6, 23, 0.5), rgba(2, 6, 23, 0.65)), url('${restaurant.image}')` }}
      >
        <div className="platformHeroInner">
          <Link
            href="/restaurants"
            className="inline-flex rounded-full border border-white/35 px-4 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            Back to Restaurants
          </Link>
          <p className="eyebrow mt-6">Restaurant</p>
          <h1>{restaurant.name}</h1>
          {restaurant.location ? <p>{restaurant.location}</p> : null}
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
                  Detailed restaurant information has not been added yet.
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

            {infoItems.length > 0 ? (
              <aside className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <p className="eyebrow">Restaurant details</p>
                <dl className="mt-5 space-y-5">
                  {infoItems.map((item) => (
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

      {galleryItems.length > 0 ? (
        <section className="platformSection pt-0">
          <div className="platformContainer">
            <MediaGallery
              mode="public"
              businessName={restaurant.name}
              items={galleryItems}
              title="Restaurant gallery"
              description="Browse the current public photo gallery for this restaurant."
            />
          </div>
        </section>
      ) : null}
    </main>
  );
}
