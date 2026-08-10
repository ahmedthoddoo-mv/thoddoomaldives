import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MediaGallery from "@/components/media/MediaGallery";
import RestaurantContactCard from "@/components/restaurant/RestaurantContactCard";
import RestaurantInteractiveMenu from "@/components/restaurant/RestaurantInteractiveMenu";
import RestaurantMenuViewer from "@/components/restaurant/RestaurantMenuViewer";
import RestaurantPromotionCard from "@/components/restaurant/RestaurantPromotionCard";
import {
  getCanonicalPublicMediaGallery,
  mediaItemsFromUrls
} from "@/lib/business-media/public";
import { formatRestaurantCuisine, normalizeRestaurantMembershipTier } from "@/lib/restaurant-menu/format";
import { getPublicRestaurantMenuData } from "@/lib/restaurant-menu/server";
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
    ? getCanonicalPublicMediaGallery(galleryItems)
    : mediaItemsFromUrls(
        restaurant.gallery && restaurant.gallery.length > 0 ? restaurant.gallery : [],
        restaurant.name,
        "restaurant",
        restaurant.id
      );

  const cuisineLabel = formatRestaurantCuisine(restaurant.cuisine);
  const detailItems = [
    cuisineLabel ? { label: "Cuisine", value: cuisineLabel } : null,
    restaurant.priceRange ? { label: "Price range", value: restaurant.priceRange } : null,
    restaurant.openingHours ? { label: "Opening hours", value: restaurant.openingHours } : null,
    restaurant.location ? { label: "Area", value: restaurant.location } : null,
    restaurant.phone ? { label: "Phone", value: restaurant.phone } : null,
    restaurant.email ? { label: "Email", value: restaurant.email } : null,
    restaurant.website ? { label: "Website", value: restaurant.website } : null,
    restaurant.address ? { label: "Address", value: restaurant.address } : null
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const menuData = await getPublicRestaurantMenuData(restaurant.id);
  const verified = restaurant.verificationStatus === "verified";
  const premium = normalizeRestaurantMembershipTier(restaurant.membershipTier) === "premium";
  const hasContactSection = Boolean(publicGalleryItems.length > 0 || restaurant.phone || restaurant.address || restaurant.openingHours || restaurant.email || restaurant.website || restaurant.instagram || restaurant.facebook || restaurant.whatsapp || restaurant.partnerWhatsapp);

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
          {cuisineLabel ? (
            <div className="platformPillRow mt-6">
              <span className="platformPill bg-white/15 text-white">{cuisineLabel}</span>
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
            </article>

            {detailItems.length > 0 ? (
              <aside className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                <p className="eyebrow">Restaurant details</p>
               <dl className="mt-5 space-y-4">
                 {detailItems.map((item) => {
                   const iconMap: Record<string, string> = {
                     Cuisine: "🍽️",
                     "Price range": "💰",
                     "Opening hours": "🕒",
                     Area: "📍",
                     Phone: "📞",
                     Email: "✉️",
                     Website: "↗",
                     Address: "📍"
                   };
                   return (
                     <div key={item.label} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                       <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-lg" aria-hidden="true">
                         {iconMap[item.label] ?? "•"}
                       </span>
                       <div>
                         <dt className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</dt>
                         <dd className="mt-1 text-base font-medium text-slate-900">{item.value}</dd>
                       </div>
                     </div>
                   );
                 })}
               </dl>
             </aside>
            ) : null}
          </div>
        </div>
      </section>

      {hasContactSection ? (
        <section id="contact" className="platformSection pt-0">
          <div className="platformContainer">
           <RestaurantContactCard
             restaurant={restaurant}
             membershipTier={restaurant.membershipTier}
             mediaItems={publicGalleryItems}
             galleryHref="#gallery"
           />
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
        <section id="gallery" className="platformSection pt-0">
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
