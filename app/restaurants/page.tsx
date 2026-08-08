import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import RestaurantCard from "@/components/cards/RestaurantCard";
import { getLivePublishedRestaurants } from "@/lib/repositories/liveReads";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Restaurants & Cafes in Thoddoo",
  description:
    "Find local cafes, seafood restaurants, fresh juice, Maldivian meals, and relaxed places to eat during your Thoddoo island stay.",
  path: "/restaurants",
  image: "/images/homepage/hero-6.jpg",
});

export default async function RestaurantsPage() {
  const restaurantRead = await getLivePublishedRestaurants();
  const restaurants = restaurantRead.data;

  return (
    <main className="platformPage">
      <section
        className="platformHero"
        style={{ backgroundImage: "url('/images/homepage/hero-6.jpg')" }}
      >
        <div className="platformHeroInner">
          <p className="eyebrow">Restaurants</p>
          <h1>Food &amp; Beverage in Thoddoo</h1>
          <p>
            Discover restaurants, cafés and local dining experiences across Thoddoo.
          </p>
        </div>
      </section>

      <section className="platformSection">
        <div className="platformContainer">
          <div className="platformSectionHeader">
            <p className="eyebrow">Dining guide</p>
            <h2>Where to Eat</h2>
            {restaurantRead.error ? <p>{restaurantRead.error}</p> : null}
          </div>

          <div className="platformGrid platformGridTwo">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
