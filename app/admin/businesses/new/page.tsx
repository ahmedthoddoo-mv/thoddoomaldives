import type { Metadata } from "next";
import { BusinessOnboardingWizard } from "@/components/onboarding/BusinessOnboardingWizard";
import { loadBusinessOnboardingDraft, type BusinessOnboardingDraftRecord } from "@/lib/onboarding/server";

export const metadata: Metadata = {
  title: "Add a business",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

export default async function AdminBusinessOnboardingPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const draftId = typeof searchParams?.draftId === "string" ? searchParams.draftId : undefined;
  const draft = draftId ? await loadBusinessOnboardingDraft(draftId, "admin") : null;
  const typedDraft = draft as BusinessOnboardingDraftRecord | null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Admin onboarding engine</p>
        <h1 className="text-3xl font-semibold text-slate-900">Create a new restaurant listing through one guided flow</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          This reusable engine keeps the common onboarding steps shared while allowing the restaurant module to hold cuisine, menu, and promotion details.
        </p>
      </div>
      <BusinessOnboardingWizard ownerType="admin" businessType={typedDraft?.businessType ?? "restaurant"} draftId={typedDraft?.id} initialValues={typedDraft?.values as Record<string, string | boolean | number | string[] | undefined> | undefined} listingId={typedDraft?.listingId ?? undefined} />
    </main>
  );
}
