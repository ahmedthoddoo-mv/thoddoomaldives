/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MediaGallery from "@/components/media/MediaGallery";
import RestaurantContactCard from "@/components/restaurant/RestaurantContactCard";
import RestaurantInteractiveMenu from "@/components/restaurant/RestaurantInteractiveMenu";
import RestaurantMenuViewer from "@/components/restaurant/RestaurantMenuViewer";
import RestaurantPromotionCard from "@/components/restaurant/RestaurantPromotionCard";
import { mediaItemsFromUrls } from "@/lib/business-media/public";
import { getPublicRestaurantMenuData } from "@/lib/restaurant-menu/server";
import { normalizeRestaurantMembershipTier } from "@/lib/restaurant-menu/format";
import { getLivePublishedRestaurantBySlug } from "@/lib/repositories/liveReads";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type RestaurantDetailPageProps = {
  params: Promise<{ slug: string }>;
};

const PUBLIC_GALLERY_MEDIA_PURPOSES = new Set(["gallery", "cover", "food", "interior", "exterior"]);

function isMenuMediaItem(item: { mediaPurpose?: string | null }) {
  return item.mediaPurpose === "menu";
}

function isPublicGalleryMediaItem(item: { mediaPurpose?: string | null }) {
  const mediaPurpose = item.mediaPurpose?.toLowerCase();
  return !mediaPurpose || PUBLIC_GALLERY_MEDIA_PURPOSES.has(mediaPurpose);
}

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

  const allMedia = restaurant.media ?? [];
  const menuItems = allMedia.filter((item) => isMenuMediaItem(item));
  const galleryItems = allMedia.filter((item) => !isMenuMediaItem(item) && isPublicGalleryMediaItem(item));
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

  const menuData = await getPublicRestaurantMenuData(restaurant.id);
  const verified = restaurant.verificationStatus === "verified";
  const premium = normalizeRestaurantMembershipTier(restaurant.membershipTier) === "premium";
  const hasContactSection = Boolean(restaurant.phone || restaurant.address || restaurant.openingHours || restaurant.email || restaurant.website || restaurant.instagram || restaurant.facebook || restaurant.whatsapp || restaurant.partnerWhatsapp);

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
            ← Back to Restaurants
          </Link>
          <p className="eyebrow mt-6">Restaurant · Thoddoo, Maldives</p>
          <h1>{restaurant.name}</h1>
          {restaurant.location ? <p className="mt-2 text-lg text-white/80">{restaurant.location}</p> : null}
          <div className="mt-6 flex flex-wrap gap-2">
            {verified ? <span className="rounded-full border border-emerald-300/50 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100">✓ Verified by iThoddoo Maldives</span> : null}
            {premium ? <span className="rounded-full border border-amber-300/50 bg-amber-500/20 px-4 py-2 text-sm font-semibold text-amber-100">Premium Partner</span> : null}
          </div>
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

      {hasContactSection ? (
        <section id="contact" className="platformSection pt-0">
          <div className="platformContainer">
            <RestaurantContactCard restaurant={restaurant} membershipTier={restaurant.membershipTier} />
          </div>
        </section>
      ) : null}

      <RestaurantPromotionCard restaurant={restaurant} />

      {menuData.categories.length > 0 && menuData.items.length > 0 ? (
        <section id="menu" className="platformSection pt-0">
          <div className="platformContainer">
            <RestaurantInteractiveMenu
              restaurantId={restaurant.id}
              restaurantName={restaurant.name}
              restaurantSlug={restaurant.slug}
              membershipTier={restaurant.membershipTier}
              restaurantWhatsApp={restaurant.whatsapp}
              partnerWhatsApp={restaurant.partnerWhatsapp}
              categories={menuData.categories}
              items={menuData.items}
            />
          </div>
        </section>
      ) : null}

      {menuItems.length > 0 && restaurant.showOriginalMenu ? (
        <section className="platformSection pt-0">
          <div className="platformContainer">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <p className="eyebrow">Official menu</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">{restaurant.name} Menu</h2>
              <p className="mt-2 text-sm text-slate-600">
                Browse the official menu pages below. The interactive menu is available above for ordering enquiries.
              </p>
              <div className="mt-6">
                <RestaurantMenuViewer items={menuItems} restaurantName={restaurant.name} />
              </div>
            </div>
          </div>
        </section>
      ) : null}

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
