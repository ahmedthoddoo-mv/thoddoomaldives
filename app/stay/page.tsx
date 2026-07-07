import BookButton from "@/components/BookButton";
import BookingInquiryForm from "@/components/BookingInquiryForm";

export default function StayPage() {
  const rooms = [
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
  ];

  const amenities = [
    "📶 Free Wi-Fi",
    "❄️ Air Conditioning",
    "🚿 Private Bathroom",
    "🔥 Hot Water",
    "🍳 Breakfast Included",
    "🚲 Bicycle Rental",
    "🚤 Airport Transfer Help",
    "🏖️ Near Bikini Beach",
    "🤝 Local Guest Support",
  ];

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
            Thoddoo Sun Sky Inn
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/90">
            Comfortable island stay with breakfast, local support, transfer help,
            and easy WhatsApp booking.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-4xl font-bold">Rooms & Prices</h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {rooms.map((room) => (
            <div key={room.name} className="rounded-3xl border bg-white p-6 shadow-sm">
              <h3 className="text-2xl font-bold">{room.name}</h3>
              <p className="mt-2 text-slate-600">👥 {room.guests}</p>
              <p className="mt-2 text-slate-600">🛏 {room.rooms}</p>
              <p className="mt-2 text-slate-600">🍳 Breakfast Included</p>
              <p className="mt-6 text-3xl font-bold">
                {room.price} <span className="text-lg font-normal">/ night</span>
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

        <h2 className="mt-16 text-4xl font-bold">Amenities</h2>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {amenities.map((item) => (
            <div key={item} className="rounded-2xl border bg-slate-50 p-4 text-lg">
              {item}
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-20">
  <BookingInquiryForm />
</section>
    </main>
  );
}