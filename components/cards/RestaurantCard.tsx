import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import type { Restaurant } from "@/types/restaurant";

export default function RestaurantCard({
  restaurant,
}: {
  restaurant: Restaurant;
}) {
  return (
    <Card>
      <div
        className="-mx-6 -mt-6 h-64 rounded-t-3xl bg-slate-200 bg-cover bg-center"
        style={{ backgroundImage: `url('${restaurant.image}')` }}
        role="img"
        aria-label={restaurant.name}
      />

      <div className="mt-6 flex flex-wrap gap-2">
        <Badge>{restaurant.priceRange}</Badge>
        <span className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold capitalize text-slate-700">
          {restaurant.cuisine[0]}
        </span>
      </div>

      <h3 className="mt-5 text-2xl font-bold">{restaurant.name}</h3>
      <p className="mt-3 font-semibold text-slate-700">
        {restaurant.tagline}
      </p>
      <p className="mt-3 leading-7 text-slate-600">
        {restaurant.description}
      </p>

      <div className="mt-6 space-y-2 text-sm font-semibold text-slate-600">
        <p>{restaurant.location}</p>
        <p>{restaurant.openingHours}</p>
      </div>
    </Card>
  );
}
