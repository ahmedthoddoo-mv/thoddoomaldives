/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Restaurant } from "@/types/restaurant";

function isPromotionActive(promotion: Restaurant["promotion"]): boolean {
  if (!promotion?.active) return false;
  const now = Date.now();
  if (promotion.startsAt) {
    const start = new Date(promotion.startsAt).getTime();
    if (Number.isFinite(start) && start > now) return false;
  }
  if (promotion.endsAt) {
    const end = new Date(promotion.endsAt).getTime();
    if (Number.isFinite(end) && end < now) return false;
  }
  return true;
}

export default function RestaurantPromotionCard({ restaurant }: { restaurant: Restaurant }) {
  const promotion = restaurant.promotion;
  if (!promotion || !isPromotionActive(promotion)) return null;

  const isVideo = promotion.mediaUrl && /\.(mp4|webm|mov)$/i.test(promotion.mediaUrl);
  const ctaHref = promotion.ctaDestination === "whatsapp"
    ? (restaurant.whatsapp || restaurant.partnerWhatsapp ? `https://wa.me/${(restaurant.whatsapp || restaurant.partnerWhatsapp || "").replace(/[^0-9]/g, "")}` : "/restaurants")
    : promotion.ctaDestination === "contact"
      ? `/restaurants/${restaurant.slug}#contact`
      : promotion.ctaDestination === "menu"
        ? `/restaurants/${restaurant.slug}#menu`
        : `/restaurants/${restaurant.slug}`;

  return (
    <section className="platformSection pt-0">
      <div className="platformContainer">
        <div className="overflow-hidden rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-slate-50 shadow-sm">
          <div className="grid gap-6 p-8 md:grid-cols-[minmax(0,1.2fr)_320px] md:p-10">
            <div>
              <p className="eyebrow">Today’s special</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">{promotion.title || "Chef’s recommendation"}</h2>
              {promotion.description ? <p className="mt-4 max-w-2xl text-base leading-8 text-slate-700">{promotion.description}</p> : null}
              {promotion.ctaLabel ? (
                <div className="mt-6">
                  <Link href={ctaHref} className="inline-flex rounded-full border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
                    {promotion.ctaLabel}
                  </Link>
                </div>
              ) : null}
            </div>
            {promotion.mediaUrl ? (
              <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100">
                {isVideo ? (
                  <video
                    className="h-full min-h-[220px] w-full object-cover"
                    src={promotion.mediaUrl}
                    muted
                    playsInline
                    loop
                    autoPlay
                    preload="metadata"
                  />
                ) : (
                  <img src={promotion.mediaUrl} alt={promotion.title || restaurant.name} className="h-full min-h-[220px] w-full object-cover" />
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
