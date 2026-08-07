import type { Restaurant } from "@/types/restaurant";
import { buildDirectionsUrl, normalizePhoneForLink, normalizeWhatsAppForLink, normalizeRestaurantMembershipTier } from "@/lib/restaurant-menu/format";

type RestaurantContactCardProps = {
  restaurant: Restaurant;
  membershipTier?: string | null;
};

export default function RestaurantContactCard({ restaurant, membershipTier }: RestaurantContactCardProps) {
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
  const details = [restaurant.address, restaurant.location].filter(Boolean);

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <p className="eyebrow">Business Contact & Location</p>
      <h2 className="mt-3 text-2xl font-semibold text-slate-950">Visit {restaurant.name}</h2>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {phoneLink ? (
            <a href={`tel:${phoneLink}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 transition hover:border-slate-400 hover:bg-slate-100">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Call</p>
                <p className="mt-1 font-semibold text-slate-900">Call {restaurant.name}</p>
              </div>
              <span className="text-xl" aria-hidden="true">📞</span>
            </a>
          ) : null}
          {whatsappLink ? (
            <a href={`https://wa.me/${whatsappLink}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/60 px-5 py-4 transition hover:border-emerald-400">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">WhatsApp</p>
                <p className="mt-1 font-semibold text-slate-900">WhatsApp {restaurant.name}</p>
              </div>
              <span className="text-xl" aria-hidden="true">💬</span>
            </a>
          ) : null}
          {restaurant.address ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Address</p>
              <p className="mt-1 text-base font-medium text-slate-900">{restaurant.address}</p>
            </div>
          ) : null}
          {restaurant.openingHours ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Opening hours</p>
              <p className="mt-1 text-base font-medium text-slate-900">{restaurant.openingHours}</p>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          {directionsUrl ? (
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-950 px-5 py-4 text-white transition hover:bg-slate-800">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">Directions</p>
                <p className="mt-1 font-semibold">Get Directions</p>
              </div>
              <span className="text-xl" aria-hidden="true">🧭</span>
            </a>
          ) : null}
          {details.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Location</p>
              <p className="mt-1 text-base font-medium text-slate-900">{details.join(" · ")}</p>
            </div>
          ) : null}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
            {restaurant.phone ? (
              <div className="border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Phone</p>
                <p className="mt-1 font-semibold text-slate-900">{restaurant.phone}</p>
              </div>
            ) : null}
            {restaurant.email ? (
              <div className="border-b border-slate-200 pb-3 pt-3 last:border-b-0 last:pb-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email</p>
                <p className="mt-1 font-semibold text-slate-900">{restaurant.email}</p>
              </div>
            ) : null}
            {restaurant.website ? (
              <div className="border-b border-slate-200 pb-3 pt-3 last:border-b-0 last:pb-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Website</p>
                <p className="mt-1 font-semibold text-slate-900">{restaurant.website}</p>
              </div>
            ) : null}
            {restaurant.instagram ? (
              <div className="border-b border-slate-200 pb-3 pt-3 last:border-b-0 last:pb-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Instagram</p>
                <p className="mt-1 font-semibold text-slate-900">@{restaurant.instagram.replace(/^@/, "")}</p>
              </div>
            ) : null}
            {restaurant.facebook ? (
              <div className="pt-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Facebook</p>
                <p className="mt-1 font-semibold text-slate-900">{restaurant.facebook}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
