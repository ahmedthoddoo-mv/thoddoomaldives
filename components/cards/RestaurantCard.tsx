import Link from "next/link";
import { formatRestaurantCuisine } from "@/lib/restaurant-menu/format";
import type { Restaurant } from "@/types/restaurant";

export default function RestaurantCard({
 restaurant,
}: {
 restaurant: Restaurant;
}) {
 const cuisineLabel = formatRestaurantCuisine(restaurant.cuisine);
 const summary = restaurant.tagline || restaurant.description;
 const verified = restaurant.verificationStatus === "verified";
 const premium = restaurant.membershipTier?.toLowerCase() === "premium";

 return (
    <Link
      href={`/restaurants/${restaurant.slug}`}
      className="platformCard block overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 focus-visible:ring-offset-4"
      aria-label={`View ${restaurant.name}`}
    >
      <div
        className="platformCardImage"
        style={{ backgroundImage: `url('${restaurant.image}')` }}
        role="img"
        aria-label={restaurant.name}
      />
      <div className="platformCardBody">
        <div className="flex flex-wrap gap-2">
          {verified ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">✓ Verified</span> : null}
          {premium ? <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Premium Partner</span> : null}
        </div>
        <h3 className="mt-3">{restaurant.name}</h3>
        {summary ? <p>{summary}</p> : null}
        <div className="platformPillRow mt-6">
          {restaurant.priceRange ? <span className="platformPill">{restaurant.priceRange}</span> : null}
          {restaurant.location ? <span className="platformPill">{restaurant.location}</span> : null}
          {cuisineLabel ? <span className="platformPill">{cuisineLabel}</span> : null}
        </div>
      </div>
    </Link>
  );
}
