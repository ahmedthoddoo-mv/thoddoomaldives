"use client";

import { useState } from "react";
import type { DailyItineraryItem } from "@/types/trip-plan";

const sampleItinerary: DailyItineraryItem[] = [
  {
    day: "Day 1 — Monday",
    title: "Arrival at Velana",
    description: "Land at Male International Airport. Meet your transfer at baggage claim and head to the speedboat dock.",
  },
  {
    day: "Day 1 Evening",
    title: "Speedboat to Thoddoo",
    description: "45-minute scenic journey on Nasru speedboat. Settle into your guesthouse and explore the main island.",
  },
  {
    day: "Day 2 — Tuesday",
    title: "Snorkeling Adventure",
    description: "Half-day snorkeling trip to nearby reefs. See turtles, rays, and tropical fish in crystal-clear waters.",
  },
  {
    day: "Day 2 Evening",
    title: "Local Dinner",
    description: "Dinner at a local restaurant featuring fresh catch of the day and traditional Maldivian cuisine.",
  },
  {
    day: "Day 3 — Wednesday",
    title: "Sandbank Excursion",
    description: "Full-day trip to pristine sandbanks with white sand and turquoise waters. Picnic lunch included.",
  },
  {
    day: "Day 4 — Thursday",
    title: "Relaxation Day",
    description: "Enjoy the guesthouse amenities, spa treatments, or explore the island on your own pace.",
  },
  {
    day: "Day 5 — Friday",
    title: "Fishing Expedition",
    description: "Traditional fishing experience with local fishermen. Learn about sustainable practices.",
  },
  {
    day: "Day 5 Evening",
    title: "Celebration Dinner",
    description: "Special farewell dinner with sunset views over the Indian Ocean.",
  },
  {
    day: "Day 6 — Saturday",
    title: "Return to Male",
    description: "Morning speedboat transfer back to Male. Afternoon flight or stopover at airport hotel.",
  },
];

const timelineIcons: Record<string, string> = {
  "Arrival at Velana": "✈️",
  "Speedboat to Thoddoo": "🚤",
  "Snorkeling Adventure": "🤽",
  "Local Dinner": "🍽️",
  "Sandbank Excursion": "🏝️",
  "Relaxation Day": "🧘",
  "Fishing Expedition": "🎣",
  "Celebration Dinner": "🍷",
  "Return to Male": "✈️",
};

export default function TripTimeline({
  itinerary = sampleItinerary,
}: {
  itinerary?: DailyItineraryItem[];
}) {
  const [expandedDay, setExpandedDay] = useState<string | null>("Day 1 — Monday");

  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-700">
            Your Perfect Trip
          </p>
          <h2 className="mt-4 text-4xl font-bold md:text-5xl">
            Sample 5-Day Itinerary
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Discover how your Thoddoo holiday might unfold with airport arrival,
            snorkeling, island adventures, and unforgettable moments.
          </p>
        </div>

        <div className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {/* Desktop timeline line */}
          <div
            className="absolute left-0 top-0 hidden h-full w-px bg-gradient-to-b from-cyan-300 via-cyan-500 to-teal-600 lg:block"
            style={{ left: "2rem" }}
          />

          {/* Timeline items */}
          {itinerary.map((item, index) => {
            const icon = timelineIcons[item.title] || "📍";
            const isExpanded = expandedDay === item.day;

            return (
              <div
                key={item.day}
                className={`relative transition-all duration-300 ${
                  index % 2 === 0 ? "md:pr-6 lg:pr-0 lg:pl-20" : "md:pl-6 lg:pl-20"
                }`}
              >
                {/* Timeline dot */}
                <div
                  className="absolute left-0 top-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-cyan-500 to-teal-600 text-2xl shadow-lg lg:left-0"
                  style={{ left: "-1.5rem" }}
                >
                  {icon}
                </div>

                {/* Content card */}
                <button
                  onClick={() =>
                    setExpandedDay(isExpanded ? null : item.day)
                  }
                  className={`block w-full text-left transition-all duration-300 rounded-2xl border bg-white p-6 shadow-md hover:-translate-y-1 hover:shadow-xl ${
                    isExpanded ? "ring-2 ring-cyan-500" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-cyan-700">
                        {item.day}
                      </p>
                      <h3 className="mt-2 text-xl font-bold text-slate-900">
                        {item.title}
                      </h3>
                      {isExpanded && (
                        <p className="mt-3 leading-7 text-slate-600">
                          {item.description}
                        </p>
                      )}
                      {!isExpanded && (
                        <p className="mt-2 line-clamp-1 text-sm text-slate-600">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <svg
                        className={`h-5 w-5 text-cyan-600 transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Call to action */}
        <div className="mt-16 text-center">
          <p className="text-lg text-slate-600">
            This itinerary is customizable based on your interests and preferences.
          </p>
          <p className="mt-2 text-sm font-semibold text-cyan-700">
            Scroll up to start planning your perfect Thoddoo holiday →
          </p>
        </div>
      </div>
    </section>
  );
}
