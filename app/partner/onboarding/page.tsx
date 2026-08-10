import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BusinessOnboardingWizard } from "@/components/onboarding/BusinessOnboardingWizard";
import { getAuthorizedPartnerScope } from "@/lib/partner-portal/partnerAccess";
import { loadBusinessOnboardingDraft, type BusinessOnboardingDraftRecord } from "@/lib/onboarding/server";

export const metadata: Metadata = {
  title: "Partner onboarding",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

export default async function PartnerOnboardingPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const scope = await getAuthorizedPartnerScope();
  if (scope.mode === "unauthenticated") redirect("/partner/login");
  if (scope.mode !== "supabase") {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Partner onboarding is not available yet for this account.</h1>
        <p className="text-sm text-slate-600">Please complete the partner account setup before using the guided onboarding engine.</p>
      </main>
    );
  }

  const draftId = typeof searchParams?.draftId === "string" ? searchParams.draftId : undefined;
  const draft = draftId ? await loadBusinessOnboardingDraft(draftId, "partner") : null;
  const typedDraft = draft as BusinessOnboardingDraftRecord | null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Partner onboarding engine</p>
        <h1 className="text-3xl font-semibold text-slate-900">Continue onboarding from the same guided steps</h1>
        <p className="max-w-3xl text-sm text-slate-600">Partners can edit their allowed listing details, while admin-controlled publication and verification remain protected.</p>
      </div>
      <BusinessOnboardingWizard
        ownerType="partner"
        businessType={typedDraft?.businessType ?? "guesthouse"}
        draftId={typedDraft?.id}
        initialValues={typedDraft?.values as Record<string, string | boolean | number | string[] | undefined> | undefined}
        listingId={typedDraft?.listingId ?? undefined}
        initialStepId={typedDraft?.currentStep}
        allowedBusinessTypes={["guesthouse", "restaurant"]}
      />
    </main>
  );
}
