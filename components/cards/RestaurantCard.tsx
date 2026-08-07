import Link from "next/link";
import type { Restaurant } from "@/types/restaurant";

export default function RestaurantCard({
  restaurant,
}: {
  restaurant: Restaurant;
}) {
  const cuisineLabel = restaurant.cuisine.filter(Boolean).join(" • ");
  const summary = restaurant.tagline || restaurant.description;

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
        <h3>{restaurant.name}</h3>
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
