import type { Metadata } from "next";
import { BusinessOnboardingWizard } from "@/components/onboarding/BusinessOnboardingWizard";
import { loadBusinessOnboardingDraft, type BusinessOnboardingDraftRecord } from "@/lib/onboarding/server";

export const metadata: Metadata = {
  title: "Edit onboarding draft",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

export default async function AdminBusinessOnboardingDraftPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const draftId = resolvedParams.id;
  const lookupDraftId = typeof resolvedSearchParams?.draftId === "string" ? resolvedSearchParams.draftId : draftId;
  const draft = lookupDraftId ? await loadBusinessOnboardingDraft(lookupDraftId, "admin") : null;
  const typedDraft = draft as BusinessOnboardingDraftRecord | null;

  const heading = typedDraft?.businessType === "guesthouse"
    ? "Resume or review the guesthouse onboarding draft"
    : typedDraft?.businessType === "restaurant"
      ? "Resume or review the restaurant onboarding draft"
      : "Resume or review the business onboarding draft";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Admin onboarding engine</p>
        <h1 className="text-3xl font-semibold text-slate-900">{heading}</h1>
      </div>
      <BusinessOnboardingWizard
        ownerType="admin"
        businessType={typedDraft?.businessType ?? "restaurant"}
        draftId={typedDraft?.id}
        initialValues={typedDraft?.values as Record<string, string | boolean | number | string[] | undefined> | undefined}
        listingId={typedDraft?.listingId ?? undefined}
        initialStepId={typedDraft?.currentStep}
      />
    </main>
  );
}
