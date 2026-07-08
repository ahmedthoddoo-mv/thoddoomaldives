"use client";

import { useState } from "react";
import { experiences } from "@/lib/experiences";

export default function ExcursionInquiryForm() {
  const [selectedExperience, setSelectedExperience] = useState(
    experiences[0]?.title ?? ""
  );
  const [preferredDate, setPreferredDate] = useState("");
  const [guests, setGuests] = useState("2");
  const [request, setRequest] = useState("");

  function handleSubmit() {
    const message = `Hi,

I would like to book an excursion in Thoddoo.

🤿 Experience: ${selectedExperience}
📅 Preferred Date: ${preferredDate}
👥 Number of Guests: ${guests}

Special Request:
${request}

I found you on iThoddoo Maldives.`;

    window.open(
      `https://wa.me/9609142538?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  }

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-3xl font-bold">Plan Your Excursion</h2>
      <p className="mt-2 text-slate-600">
        Tell us what you would like to do and we will confirm availability and
        pricing on WhatsApp.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 md:col-span-2">
          <span className="font-semibold">Experience</span>
          <select
            value={selectedExperience}
            onChange={(e) => setSelectedExperience(e.target.value)}
            className="rounded-xl border p-3"
          >
            {experiences.map((item) => (
              <option key={item.slug} value={item.title}>
                {item.title}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="font-semibold">Preferred Date</span>
          <input
            type="date"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            className="rounded-xl border p-3"
          />
        </label>

        <label className="grid gap-2">
          <span className="font-semibold">Number of Guests</span>
          <input
            type="number"
            min="1"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="rounded-xl border p-3"
          />
        </label>

        <label className="grid gap-2 md:col-span-2">
          <span className="font-semibold">Special Request</span>
          <textarea
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            className="min-h-28 rounded-xl border p-3"
            placeholder="Example: private trip, snorkeling gear sizes, combine with sandbank..."
          />
        </label>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 w-full rounded-full bg-green-500 px-6 py-4 font-semibold text-white transition hover:bg-green-600"
      >
        Send Excursion Inquiry on WhatsApp
      </button>
    </div>
  );
}
