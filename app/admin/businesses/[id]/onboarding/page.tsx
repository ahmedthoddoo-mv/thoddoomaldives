import type { Metadata } from "next";
import { BusinessOnboardingWizard } from "@/components/onboarding/BusinessOnboardingWizard";
import { loadBusinessOnboardingDraft, type BusinessOnboardingDraftRecord } from "@/lib/onboarding/server";

export const metadata: Metadata = {
  title: "Edit onboarding draft",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

export default async function AdminBusinessOnboardingDraftPage({ params, searchParams }: { params: { id: string }; searchParams?: Record<string, string | string[] | undefined> }) {
  const draftId = params.id;
  const lookupDraftId = typeof searchParams?.draftId === "string" ? searchParams.draftId : draftId;
  const draft = lookupDraftId ? await loadBusinessOnboardingDraft(lookupDraftId, "admin") : null;
  const typedDraft = draft as BusinessOnboardingDraftRecord | null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Admin onboarding engine</p>
        <h1 className="text-3xl font-semibold text-slate-900">Resume or review the business onboarding draft</h1>
      </div>
      <BusinessOnboardingWizard ownerType="admin" businessType={typedDraft?.businessType ?? "restaurant"} draftId={typedDraft?.id} initialValues={typedDraft?.values as Record<string, string | boolean | number | string[] | undefined> | undefined} listingId={typedDraft?.listingId ?? undefined} />
    </main>
  );
}
