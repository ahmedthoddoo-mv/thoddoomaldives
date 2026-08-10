import type { Metadata } from "next";
import { AdminBusinessOnboardingClient } from "@/components/onboarding/AdminBusinessOnboardingClient";
import { loadBusinessOnboardingDraft, type BusinessOnboardingDraftRecord } from "@/lib/onboarding/server";

export const metadata: Metadata = {
  title: "Add a business",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

export default async function AdminBusinessOnboardingPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const draftId = typeof resolvedSearchParams?.draftId === "string" ? resolvedSearchParams.draftId : undefined;
  const requestedType = typeof resolvedSearchParams?.type === "string" ? resolvedSearchParams.type : undefined;
  const draft = draftId ? await loadBusinessOnboardingDraft(draftId, "admin") : null;
  const typedDraft = draft as BusinessOnboardingDraftRecord | null;

  return <AdminBusinessOnboardingClient draft={typedDraft} requestedType={requestedType} />;
}
