import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Restaurants & Cafes in Thoddoo",
  description:
    "Find local cafes, seafood restaurants, fresh juice, Maldivian meals, and relaxed places to eat during your Thoddoo island stay.",
  path: "/restaurants",
  image: "/images/homepage/hero-6.jpg",
});

export default function RestaurantsPage() {
  const restaurants = [
    {
      name: "Local Cafés",
      description:
        "Enjoy authentic Maldivian breakfasts, curries, fresh seafood and tropical fruit juices.",
    },
    {
      name: "Beach Restaurants",
      description:
        "Relax near the beach while enjoying grilled seafood, burgers, pizzas and refreshing drinks.",
    },
    {
      name: "Coffee & Snacks",
      description:
        "Perfect for coffee lovers, desserts, smoothies and quick meals after exploring the island.",
    },
    {
      name: "Fresh Seafood",
      description:
        "Taste locally caught tuna, reef fish and traditional Maldivian dishes prepared fresh every day.",
    },
  ];

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
          </div>

          <div className="platformGrid platformGridTwo">
            {restaurants.map((restaurant) => (
              <article key={restaurant.name} className="platformCard">
                <div className="platformCardBody">
                  <h3>{restaurant.name}</h3>
                  <p>{restaurant.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
