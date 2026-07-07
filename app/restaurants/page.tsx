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
    <main className="min-h-screen bg-white text-slate-900">
      <section
        className="relative flex min-h-[60vh] items-center bg-cover bg-center px-6 text-white md:px-12"
        style={{ backgroundImage: "url('/images/homepage/hero-2.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em]">
            Restaurants
          </p>

          <h1 className="text-5xl font-bold md:text-7xl">
            Eat & Drink in Thoddoo
          </h1>

          <p className="mt-6 text-lg text-white/90">
            Discover local cafés, seafood restaurants, fresh tropical fruit and
            authentic Maldivian cuisine.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-4xl font-bold">
          Where to Eat
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.name}
              className="rounded-3xl border bg-white p-8 shadow-sm"
            >
              <h3 className="text-2xl font-bold">
                🍽️ {restaurant.name}
              </h3>

              <p className="mt-4 text-slate-600">
                {restaurant.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}