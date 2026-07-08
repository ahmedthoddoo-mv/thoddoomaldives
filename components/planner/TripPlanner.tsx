"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

const interests = [
  "Snorkeling",
  "Sandbank",
  "Diving",
  "Fishing",
  "Water Sports",
  "Relaxation",
  "Local Food",
  "Farm Tour",
  "Photography",
] as const;

const budgetRanges = [
  "Under USD 500",
  "USD 500 - 1,000",
  "USD 1,000 - 2,000",
  "USD 2,000+",
] as const;

const accommodationTypes = [
  "Guesthouse",
  "Boutique Stay",
  "Family Room",
  "Couple Stay",
  "Best Available",
] as const;

type TripPlannerState = {
  arrivalDate: string;
  departureDate: string;
  adults: string;
  children: string;
  budgetRange: string;
  accommodationType: string;
  interests: string[];
};

const initialState: TripPlannerState = {
  arrivalDate: "",
  departureDate: "",
  adults: "2",
  children: "0",
  budgetRange: budgetRanges[1],
  accommodationType: accommodationTypes[0],
  interests: [],
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm font-semibold uppercase tracking-widest text-slate-500">
      {children}
    </label>
  );
}

export default function TripPlanner() {
  const router = useRouter();
  const [form, setForm] = useState<TripPlannerState>(initialState);

  const conciergeLink = useMemo(() => {
    const params = new URLSearchParams({
      planner: "true",
      concierge: "whatsapp",
    });

    return `/contact?${params.toString()}`;
  }, []);

  function updateField(field: keyof TripPlannerState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function toggleInterest(interest: string) {
    setForm((current) => {
      const selected = current.interests.includes(interest);

      return {
        ...current,
        interests: selected
          ? current.interests.filter((item) => item !== interest)
          : [...current.interests, interest],
      };
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams({
      planner: "true",
      arrivalDate: form.arrivalDate,
      departureDate: form.departureDate,
      adults: form.adults,
      children: form.children,
      budgetRange: form.budgetRange,
      accommodationType: form.accommodationType,
    });

    form.interests.forEach((interest) => {
      params.append("interests", interest);
    });

    router.push(`/contact?${params.toString()}`);
  }

  return (
    <section id="trip-planner" className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-[2rem] border bg-white p-5 shadow-2xl shadow-slate-200/80 md:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-700">
                Plan Your Maldives Trip
              </p>
              <h2 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
                Tell us your dates. We will shape the island plan.
              </h2>
              <p className="mt-5 leading-8 text-slate-600">
                Share the essentials and our local concierge will help match
                you with stays, transfers, and experiences in Thoddoo. AI
                Concierge support will power this flow later.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="grid gap-2">
                  <FieldLabel>Arrival Date</FieldLabel>
                  <input
                    type="date"
                    value={form.arrivalDate}
                    onChange={(event) =>
                      updateField("arrivalDate", event.target.value)
                    }
                    className="rounded-2xl border bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600 focus:bg-white"
                  />
                </div>

                <div className="grid gap-2">
                  <FieldLabel>Departure Date</FieldLabel>
                  <input
                    type="date"
                    value={form.departureDate}
                    onChange={(event) =>
                      updateField("departureDate", event.target.value)
                    }
                    className="rounded-2xl border bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="grid gap-2">
                  <FieldLabel>Number of Adults</FieldLabel>
                  <input
                    type="number"
                    min="1"
                    value={form.adults}
                    onChange={(event) =>
                      updateField("adults", event.target.value)
                    }
                    className="rounded-2xl border bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600 focus:bg-white"
                  />
                </div>

                <div className="grid gap-2">
                  <FieldLabel>Number of Children</FieldLabel>
                  <input
                    type="number"
                    min="0"
                    value={form.children}
                    onChange={(event) =>
                      updateField("children", event.target.value)
                    }
                    className="rounded-2xl border bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="grid gap-2">
                  <FieldLabel>Budget Range</FieldLabel>
                  <select
                    value={form.budgetRange}
                    onChange={(event) =>
                      updateField("budgetRange", event.target.value)
                    }
                    className="rounded-2xl border bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600 focus:bg-white"
                  >
                    {budgetRanges.map((range) => (
                      <option key={range}>{range}</option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <FieldLabel>Accommodation Type</FieldLabel>
                  <select
                    value={form.accommodationType}
                    onChange={(event) =>
                      updateField("accommodationType", event.target.value)
                    }
                    className="rounded-2xl border bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600 focus:bg-white"
                  >
                    {accommodationTypes.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-3">
                <FieldLabel>Interests</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => {
                    const selected = form.interests.includes(interest);

                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          selected
                            ? "border-cyan-700 bg-cyan-700 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-cyan-700"
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-3 sm:flex-row">
                <button
                  type="submit"
                  className="rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700"
                >
                  Plan My Trip
                </button>
                <Button href={conciergeLink} variant="green">
                  WhatsApp Concierge
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
