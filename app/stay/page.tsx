import BookButton from "@/components/BookButton";

export default function StayPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section
        className="relative flex min-h-[70vh] items-center bg-cover bg-center px-6 text-white md:px-12"
        style={{ backgroundImage: "url('/images/hero-thoddoo.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em]">
            Stay in Thoddoo
          </p>

          <h1 className="text-5xl font-bold md:text-7xl">
            Book Your Island Stay
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-white/90">
            Start with trusted local stays in Thoddoo. Send a direct WhatsApp
            inquiry and confirm your room easily.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-4xl font-bold">Featured Guesthouse</h2>

        <div className="mt-8 overflow-hidden rounded-3xl border shadow-sm md:grid md:grid-cols-2">
          <div
            className="min-h-[320px] bg-cover bg-center"
            style={{ backgroundImage: "url('/images/hero-thoddoo.jpg')" }}
          />

          <div className="p-6 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
              Recommended Stay
            </p>

            <h3 className="mt-3 text-3xl font-bold">Thoddoo Sun Sky Inn</h3>

            <p className="mt-4 text-slate-600">
              Comfortable guesthouse stay in Thoddoo with local hospitality,
              easy access to island experiences, beach visits, and transfers.
            </p>

            <div className="mt-6 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
              <p>✅ Local island experience</p>
              <p>✅ WhatsApp booking</p>
              <p>✅ Transfer assistance</p>
              <p>✅ Excursion help</p>
              <p>✅ Breakfast options</p>
              <p>✅ Guest support</p>
            </div>

            <div className="mt-8 rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Starting from</p>
              <p className="text-3xl font-bold">$85 / night</p>
              <p className="mt-1 text-sm text-slate-500">
                Final price depends on dates, guests, and room type.
              </p>
            </div>

            <div className="mt-8">
              <BookButton phone="9609910136" name="Thoddoo Sun Sky Inn" />
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
  {[
    {
      name: "Deluxe Double Room",
      price: "$85",
      rooms: "8 Rooms Available",
      guests: "2 Adults",
    },
    {
      name: "Family Room",
      price: "$110",
      rooms: "1 Room Available",
      guests: "4 Adults",
    },
  ].map((room) => (
    <div
      key={room.name}
      className="rounded-2xl border p-6 shadow-sm bg-white"
    >
      <h3 className="text-2xl font-bold">{room.name}</h3>

      <p className="mt-2 text-gray-600">
        👥 {room.guests}
      </p>

      <p className="mt-2 text-gray-600">
        🛏 {room.rooms}
      </p>

      <p className="mt-2 text-gray-600">
        🍳 Breakfast Included
      </p>

      <p className="mt-6 text-3xl font-bold">
        {room.price}
        <span className="text-lg font-normal"> / night</span>
      </p>

      <div className="mt-6">
        <BookButton
          phone="9609910136"
          name={`Thoddoo Sun Sky Inn - ${room.name}`}
        />
      </div>
    </div>
  ))}
</div>
          </div>
        </div>
      </section>
    </main>
  );
}