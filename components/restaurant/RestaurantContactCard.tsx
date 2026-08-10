/* eslint-disable @next/next/no-img-element */
import type { BusinessMediaItem } from "@/types/business-media";
import type { Restaurant } from "@/types/restaurant";
import { buildDirectionsUrl, normalizePhoneForLink, normalizeWhatsAppForLink, normalizeRestaurantMembershipTier } from "@/lib/restaurant-menu/format";

type RestaurantContactCardProps = {
  restaurant: Restaurant;
  membershipTier?: string | null;
  mediaItems?: BusinessMediaItem[];
  galleryHref?: string;
};

export default function RestaurantContactCard({ restaurant, membershipTier, mediaItems = [], galleryHref }: RestaurantContactCardProps) {
  const phoneLink = normalizePhoneForLink(restaurant.phone ?? null);
  const premium = normalizeRestaurantMembershipTier(membershipTier) === "premium";
  const whatsappLink = premium ? normalizeWhatsAppForLink(restaurant.whatsapp ?? restaurant.partnerWhatsapp ?? null) : "";
  const directionsUrl = buildDirectionsUrl({
    address: restaurant.address,
    location: restaurant.location,
    latitude: restaurant.latitude,
    longitude: restaurant.longitude,
    name: restaurant.name
  });
  const displayMedia = mediaItems.filter((item) => item.isPublic).slice(0, 4);
  const hasContactSummary = Boolean(restaurant.openingHours || phoneLink || whatsappLink || directionsUrl || restaurant.address || restaurant.location || restaurant.email || restaurant.website);

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="eyebrow">Business Contact & Location</p>
      <h2 className="mt-3 text-2xl font-semibold text-slate-950">Visit {restaurant.name}</h2>

      {displayMedia.length > 0 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_0.7fr] lg:grid-rows-2">
          {displayMedia.map((item, index) => {
            const isPrimary = index === 0;
            const showOverlay = index === displayMedia.length - 1 && mediaItems.length > displayMedia.length && galleryHref;
            return (
              <div
                key={item.id}
                className={`group relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100 ${isPrimary ? "min-h-[260px] sm:min-h-[320px] lg:row-span-2" : "min-h-[140px] sm:min-h-[180px]"}`}
              >
                <img
                  src={item.url}
                  alt={item.altText || restaurant.name}
                  className={`h-full w-full object-cover transition duration-300 group-hover:scale-[1.02] ${isPrimary ? "aspect-[4/3] lg:aspect-auto" : "aspect-[4/3]"}`}
                  loading={index === 0 ? "eager" : "lazy"}
                />
                {showOverlay ? (
                  <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent p-4">
                    <a
                      href={galleryHref}
                      className="inline-flex items-center rounded-full border border-white/30 bg-white/85 px-3 py-2 text-sm font-semibold text-slate-950 backdrop-blur transition hover:bg-white"
                    >
                      View all photos
                    </a>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {hasContactSummary ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            {restaurant.openingHours ? (
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-50 text-lg text-cyan-700" aria-hidden="true">🕒</span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Opening hours</p>
                    <p className="mt-1 font-semibold text-slate-900">{restaurant.openingHours}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {phoneLink ? (
              <a href={`tel:${phoneLink}`} className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-white px-5 py-4 transition hover:border-cyan-400 hover:shadow-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Phone</p>
                  <p className="mt-1 font-semibold text-slate-900">{restaurant.phone}</p>
                </div>
                <span className="text-xl text-cyan-700" aria-hidden="true">📞</span>
              </a>
            ) : null}

            {restaurant.email ? (
              <a href={`mailto:${restaurant.email}`} className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-white px-5 py-4 transition hover:border-cyan-400 hover:shadow-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Email</p>
                  <p className="mt-1 font-semibold text-slate-900">{restaurant.email}</p>
                </div>
                <span className="text-xl text-cyan-700" aria-hidden="true">✉️</span>
              </a>
            ) : null}
          </div>

          <div className="space-y-4">
            {directionsUrl ? (
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-slate-950 px-5 py-5 text-white transition hover:bg-slate-800">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Directions</p>
                  <p className="mt-1 font-semibold">Get Directions</p>
                  {restaurant.address || restaurant.location ? <p className="mt-1 text-sm text-slate-300">{[restaurant.address, restaurant.location].filter(Boolean).join(" · ")}</p> : null}
                </div>
                <span className="text-2xl text-cyan-300" aria-hidden="true">🧭</span>
              </a>
            ) : null}

            {whatsappLink ? (
              <a href={`https://wa.me/${whatsappLink}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-[1.25rem] border border-emerald-200 bg-emerald-50/70 px-5 py-4 transition hover:border-emerald-400">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">WhatsApp</p>
                  <p className="mt-1 font-semibold text-slate-900">Contact via WhatsApp</p>
                </div>
                <span className="text-xl text-emerald-700" aria-hidden="true">💬</span>
              </a>
            ) : null}

            {(restaurant.website || restaurant.address || restaurant.location) ? (
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-5">
                {restaurant.website ? (
                  <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:border-cyan-400">
                    <span>Visit website</span>
                    <span className="text-cyan-700" aria-hidden="true">↗</span>
                  </a>
                ) : null}
                {(restaurant.address || restaurant.location) ? (
                  <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    {[restaurant.address, restaurant.location].filter(Boolean).join(" · ")}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
