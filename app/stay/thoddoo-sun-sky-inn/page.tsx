import BookButton from "@/components/BookButton";
import BookingInquiryForm from "@/components/BookingInquiryForm";

export default function ThoddooSunSkyInnPage() {
  const amenities = [
    "📶 Free Wi-Fi",
    "❄️ Air Conditioning",
    "🚿 Private Bathroom",
    "🔥 Hot Water",
    "🍳 Breakfast Included",
    "🚲 Bicycle Rental",
    "🚤 Airport Transfer Help",
    "🏖️ Near Bikini Beach",
    "🤿 Excursion Assistance",
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section
        className="relative flex min-h-[70vh] items-center bg-cover bg-center px-6 text-white md:px-12"
        style={{ backgroundImage: "url('/images/stay/guesthouse-front.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em]">
            Featured Guesthouse
          </p>
          <h1 className="text-5xl font-bold md:text-7xl">
            Thoddoo Sun Sky Inn
          </h1>
          <p className="mt-6 text-lg text-white/90">
            A peaceful tropical guesthouse with comfortable rooms, breakfast,
            local support, and easy access to island experiences.
          </p>

          <div className="mt-8">
            <BookButton phone="9609910136" name="Thoddoo Sun Sky Inn" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-4xl font-bold">Rooms</h2>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
            <div
              className="h-80 bg-cover bg-center"
              style={{ backgroundImage: "url('/images/rooms/deluxe-1.jpg')" }}
            />
            <div className="p-6">
              <h3 className="text-2xl font-bold">Deluxe Double Room</h3>
              <p className="mt-3 text-slate-600">
                Spacious room with wooden ceiling, air conditioning, private
                bathroom, and comfortable double bed.
              </p>
              <p className="mt-5 text-3xl font-bold">$85 / night</p>
              <p className="mt-2 text-sm text-slate-500">Breakfast included</p>
              <div className="mt-6">
                <BookButton
                  phone="9609910136"
                  name="Thoddoo Sun Sky Inn - Deluxe Double Room"
                />
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
            <div
              className="h-80 bg-cover bg-center"
              style={{ backgroundImage: "url('/images/rooms/family-1.jpg')" }}
            />
            <div className="p-6">
              <h3 className="text-2xl font-bold">Family / Twin Room</h3>
              <p className="mt-3 text-slate-600">
                Comfortable twin room option for friends, families, and divers,
                with private bathroom and garden access.
              </p>
              <p className="mt-5 text-3xl font-bold">$110 / night</p>
              <p className="mt-2 text-sm text-slate-500">Breakfast included</p>
              <div className="mt-6">
                <BookButton
                  phone="9609910136"
                  name="Thoddoo Sun Sky Inn - Family Room"
                />
              </div>
            </div>
          </div>
        </div>

        <h2 className="mt-16 text-4xl font-bold">Amenities</h2>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {amenities.map((item) => (
            <div key={item} className="rounded-2xl border bg-slate-50 p-4 text-lg">
              {item}
            </div>
          ))}
        </div>

        <section className="mt-16">
          <BookingInquiryForm />
        </section>
      </section>
    </main>
  );
}