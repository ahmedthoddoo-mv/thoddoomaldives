import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <HeroSlider />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
          Why Thoddoo
        </p>
        <h2 className="mt-3 text-4xl font-bold">
          Beaches, turtles, farms, and real island life.
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            "🏖️ Beautiful Bikini Beach",
            "🐢 Turtle snorkeling areas",
            "🍉 Famous watermelon farms",
            "🚤 Easy speedboat transfers",
            "🏨 Local guesthouse stays",
            "🤿 Island experiences",
          ].map((item) => (
            <div key={item} className="rounded-2xl border bg-white p-5 font-medium">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
            Featured Stay
          </p>
          <h2 className="mt-3 text-4xl font-bold">Thoddoo Sun Sky Inn</h2>

          <a
            href="/stay/thoddoo-sun-sky-inn"
            className="mt-8 inline-block rounded-full bg-slate-900 px-6 py-3 font-semibold text-white"
          >
            View Guesthouse
          </a>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  );
}
