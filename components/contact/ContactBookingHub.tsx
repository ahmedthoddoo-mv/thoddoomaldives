"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  formatPlannerMessage,
  formatPlannerValue,
  generatePlannerWhatsAppLink,
} from "@/lib/planner";
import type { PlannedTrip } from "@/types/planner";

const emptyTrip: PlannedTrip = {
  arrivalDate: "",
  departureDate: "",
  adults: "",
  children: "",
  budgetRange: "",
  accommodationType: "",
  interests: [],
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="font-semibold text-slate-800">{children}</span>;
}

export default function ContactBookingHub({
  plannedTrip,
}: {
  plannedTrip: PlannedTrip | null;
}) {
  const [form, setForm] = useState<PlannedTrip>(plannedTrip ?? emptyTrip);
  const [request, setRequest] = useState("");

  const currentTrip = useMemo(
    () => ({
      ...form,
      interests: form.interests.filter(Boolean),
    }),
    [form]
  );

  const whatsappLink = generatePlannerWhatsAppLink({
    plannedTrip: currentTrip,
  });

  function updateTextField(
    field: Exclude<keyof PlannedTrip, "interests">,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateInterests(value: string) {
    setForm((current) => ({
      ...current,
      interests: value
        .split(",")
        .map((interest) => interest.trim())
        .filter(Boolean),
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = `${formatPlannerMessage(currentTrip)}

Additional Request:
${request.trim() || "Not specified"}`;

    window.open(
      `https://wa.me/9609142538?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  }

  if (!plannedTrip) {
    return null;
  }

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
              Planner Summary
            </p>
            <h2 className="mt-3 text-4xl font-bold">Your Planned Trip</h2>

            <dl className="mt-8 grid gap-4 text-slate-700">
              <div>
                <dt className="font-semibold text-slate-900">Arrival:</dt>
                <dd>{formatPlannerValue(plannedTrip.arrivalDate)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Departure:</dt>
                <dd>{formatPlannerValue(plannedTrip.departureDate)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Adults:</dt>
                <dd>{formatPlannerValue(plannedTrip.adults)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Children:</dt>
                <dd>{formatPlannerValue(plannedTrip.children)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Budget:</dt>
                <dd>{formatPlannerValue(plannedTrip.budgetRange)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">
                  Accommodation:
                </dt>
                <dd>{formatPlannerValue(plannedTrip.accommodationType)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Interests:</dt>
                <dd>{formatPlannerValue(plannedTrip.interests)}</dd>
              </div>
            </dl>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-block rounded-full bg-green-500 px-6 py-3 font-semibold text-white transition hover:bg-green-600"
            >
              Send via WhatsApp
            </a>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border bg-white p-6 shadow-sm md:p-8"
          >
            <h2 className="text-3xl font-bold">Send Your Inquiry</h2>
            <p className="mt-2 text-slate-600">
              Your trip details are prefilled. You can adjust anything before
              sending it to the local concierge team.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <FieldLabel>Arrival</FieldLabel>
                <input
                  type="date"
                  value={form.arrivalDate}
                  onChange={(event) =>
                    updateTextField("arrivalDate", event.target.value)
                  }
                  className="rounded-xl border p-3"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Departure</FieldLabel>
                <input
                  type="date"
                  value={form.departureDate}
                  onChange={(event) =>
                    updateTextField("departureDate", event.target.value)
                  }
                  className="rounded-xl border p-3"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Adults</FieldLabel>
                <input
                  type="number"
                  min="1"
                  value={form.adults}
                  onChange={(event) =>
                    updateTextField("adults", event.target.value)
                  }
                  className="rounded-xl border p-3"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Children</FieldLabel>
                <input
                  type="number"
                  min="0"
                  value={form.children}
                  onChange={(event) =>
                    updateTextField("children", event.target.value)
                  }
                  className="rounded-xl border p-3"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Budget</FieldLabel>
                <input
                  value={form.budgetRange}
                  onChange={(event) =>
                    updateTextField("budgetRange", event.target.value)
                  }
                  className="rounded-xl border p-3"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Accommodation</FieldLabel>
                <input
                  value={form.accommodationType}
                  onChange={(event) =>
                    updateTextField("accommodationType", event.target.value)
                  }
                  className="rounded-xl border p-3"
                />
              </label>

              <label className="grid gap-2 md:col-span-2">
                <FieldLabel>Interests</FieldLabel>
                <input
                  value={form.interests.join(", ")}
                  onChange={(event) => updateInterests(event.target.value)}
                  className="rounded-xl border p-3"
                />
              </label>

              <label className="grid gap-2 md:col-span-2">
                <FieldLabel>Additional Request</FieldLabel>
                <textarea
                  value={request}
                  onChange={(event) => setRequest(event.target.value)}
                  className="min-h-52 rounded-xl border p-3"
                  placeholder="Example: airport arrival time, room preference, private excursion request..."
                />
              </label>
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-full bg-slate-900 px-6 py-4 font-semibold text-white transition hover:bg-slate-700"
            >
              Send Inquiry
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
