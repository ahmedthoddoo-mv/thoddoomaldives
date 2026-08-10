"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BusinessOnboardingWizard } from "@/components/onboarding/BusinessOnboardingWizard";
import type { BusinessOnboardingDraftRecord } from "@/lib/onboarding/server";

type AdminBusinessOnboardingClientProps = {
  draft: BusinessOnboardingDraftRecord | null;
  requestedType?: string;
};

const implementedTypes = ["guesthouse", "restaurant"] as const;

function getHeaderCopy(type: string | null) {
  if (type === "guesthouse") {
    return {
      title: "Create a new guesthouse listing",
      description: "Add property details, rooms, amenities, photos, booking contacts and policies through one guided flow."
    };
  }
  if (type === "restaurant") {
    return {
      title: "Create a new restaurant listing",
      description: "Add cuisine, menu, promotions, media, and publication controls through one guided flow."
    };
  }
  return {
    title: "Create a new business listing through one guided flow",
    description: "Choose the category first, then complete the shared onboarding workflow with category-specific steps."
  };
}

export function AdminBusinessOnboardingClient({ draft, requestedType }: AdminBusinessOnboardingClientProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(() => {
    if (draft?.businessType) return draft.businessType;
    if (requestedType && implementedTypes.includes(requestedType as (typeof implementedTypes)[number])) return requestedType;
    return null;
  });
  const copy = useMemo(() => getHeaderCopy(selectedType), [selectedType]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Admin onboarding engine</p>
        <h1 className="text-3xl font-semibold text-slate-900">{copy.title}</h1>
        <p className="max-w-3xl text-sm text-slate-600">{copy.description}</p>
      </div>

      {!selectedType ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">What type of business are you adding?</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {implementedTypes.map((typeOption) => (
              <button
                key={typeOption}
                type="button"
                className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 text-left text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-white"
                onClick={() => {
                  setSelectedType(typeOption);
                  router.replace(`/admin/businesses/new?type=${typeOption}`);
                }}
              >
                {typeOption === "guesthouse" ? "Guesthouse" : "Restaurant"}
              </button>
            ))}
          </div>
        </section>
      ) : (
        <BusinessOnboardingWizard
          ownerType="admin"
          businessType={selectedType}
          draftId={draft?.id}
          initialValues={draft?.values as Record<string, string | boolean | number | string[] | undefined> | undefined}
          listingId={draft?.listingId ?? undefined}
          initialStepId={draft?.currentStep}
          allowedBusinessTypes={[...implementedTypes]}
          onBusinessTypeChange={(nextType) => {
            setSelectedType(nextType);
            if (!draft?.id) {
              router.replace(`/admin/businesses/new?type=${nextType}`);
            }
          }}
        />
      )}
    </main>
  );
}
