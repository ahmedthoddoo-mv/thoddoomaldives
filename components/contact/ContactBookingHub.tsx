"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { submitContactEnquiry } from "@/app/contact/actions";
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
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestWhatsapp, setGuestWhatsapp] = useState("");
  const [request, setRequest] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const [isSubmitting, startSubmitting] = useTransition();

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitMessage("");
    setSubmitErrors([]);
    startSubmitting(async () => {
      const result = await submitContactEnquiry({
        name: guestName,
        email: guestEmail,
        whatsapp: guestWhatsapp,
        request,
        plannedTrip: currentTrip
      });

      if (!result.ok) {
        setSubmitMessage(result.message);
        setSubmitErrors(result.errors ?? []);
        return;
      }

      setSubmitMessage(result.message);
    });
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
                <FieldLabel>Name</FieldLabel>
                <input
                  value={guestName}
                  onChange={(event) => setGuestName(event.target.value)}
                  className="rounded-xl border p-3"
                  placeholder="Your name"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>Email</FieldLabel>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(event) => setGuestEmail(event.target.value)}
                  className="rounded-xl border p-3"
                  placeholder="you@example.com"
                />
              </label>

              <label className="grid gap-2">
                <FieldLabel>WhatsApp</FieldLabel>
                <input
                  value={guestWhatsapp}
                  onChange={(event) => setGuestWhatsapp(event.target.value)}
                  className="rounded-xl border p-3"
                  placeholder="+960 700 0000"
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

            {submitErrors.length > 0 ? (
              <div className="bookingValidationPanel mt-6" role="alert">
                <strong>Please fix these details</strong>
                <ul>
                  {submitErrors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {submitMessage ? (
              <p className="mt-6 text-sm text-slate-700">{submitMessage}</p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-full bg-slate-900 px-6 py-4 font-semibold text-white transition hover:bg-slate-700"
            >
              {isSubmitting ? "Sending..." : "Send Inquiry"}
            </button>

            <a
              href={`https://wa.me/9609142538?text=${encodeURIComponent(`${formatPlannerMessage(currentTrip)}\n\nAdditional Request:\n${request.trim() || "Not specified"}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="platformButtonSecondary mt-4 inline-block text-center"
            >
              Continue on WhatsApp
            </a>
          </form>
        </div>
      </div>
    </section>
  );
}
