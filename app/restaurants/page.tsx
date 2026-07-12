import type { Metadata } from "next";
import { getLiveRestaurants } from "@/lib/repositories/liveReads";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Restaurants & Cafes in Thoddoo",
  description:
    "Find local cafes, seafood restaurants, fresh juice, Maldivian meals, and relaxed places to eat during your Thoddoo island stay.",
  path: "/restaurants",
  image: "/images/homepage/hero-6.jpg",
});

export default async function RestaurantsPage() {
  const restaurantRead = await getLiveRestaurants();
  const restaurants = restaurantRead.data;

  return (
    <main className="platformPage">
      <section
        className="platformHero"
        style={{ backgroundImage: "url('/images/homepage/hero-6.jpg')" }}
      >
        <div className="platformHeroInner">
          <p className="eyebrow">Restaurants</p>
          <h1>Eat & Drink in Thoddoo</h1>
          <p>
            Discover local cafés, seafood restaurants, fresh tropical fruit and
            authentic Maldivian cuisine.
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
              <article key={restaurant.id} className="platformCard">
                <div
                  className="platformCardImage"
                  style={{ backgroundImage: `url('${restaurant.image}')` }}
                />
                <div className="platformCardBody">
                  <h3>{restaurant.name}</h3>
                  <p>{restaurant.description}</p>
                  <div className="platformPillRow mt-6">
                    <span className="platformPill">{restaurant.priceRange}</span>
                    <span className="platformPill">{restaurant.location}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
