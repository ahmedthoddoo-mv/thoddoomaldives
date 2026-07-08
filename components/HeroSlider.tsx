"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const images = [
  "/images/homepage/hero-1.jpg",
  "/images/homepage/hero-2.jpg",
  "/images/homepage/hero-3.jpg",
  "/images/homepage/hero-4.jpg",
  "/images/homepage/hero-5.jpg",
  "/images/homepage/hero-6.jpg",
];

export default function HeroSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-6 text-white md:px-12">
      {images.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url('${image}')` }}
        />
      ))}

      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 max-w-4xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em]">
          Local Island Maldives
        </p>

        <h1 className="text-5xl font-bold leading-tight md:text-7xl">
          Discover the Real Maldives in Thoddoo
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-white/90">
          Plan your stay, book island experiences, arrange transfers, and
          explore Thoddoo with trusted local guidance.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/stay"
            className="rounded-full bg-white px-6 py-3 font-semibold text-slate-900"
          >
            Book Your Stay
          </Link>

          <Link
            href="/experiences"
            className="rounded-full border border-white px-6 py-3 font-semibold text-white"
          >
            Explore Experiences
          </Link>
        </div>
      </div>
    </section>
  );
}
