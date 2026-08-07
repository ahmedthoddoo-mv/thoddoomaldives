import type { Metadata } from "next";
import { PartnerAccessStateLayout } from "@/components/partner-portal/PartnerAccessStateLayout";
import { getCurrentPartnerPortalData } from "@/lib/partner-portal/partnerAccess";

export const metadata: Metadata = {
  title: "Partner Access Denied"
};

export default async function PartnerAccessDeniedPage() {
  console.info("[prod-auth-debug] partner-access-denied:start");
  let portalData!: Awaited<ReturnType<typeof getCurrentPartnerPortalData>>;
  try {
    portalData = await getCurrentPartnerPortalData();
    console.info("[prod-auth-debug] partner-access-denied:data-loaded", { source: portalData.source });
  } catch (error) {
    const details = error && typeof error === "object" ? error as { name?: unknown; code?: unknown; status?: unknown } : {};
    console.error("[prod-auth-debug] partner-access-denied:threw", {
      name: typeof details.name === "string" ? details.name : error instanceof Error ? error.name : "UnknownError",
      code: typeof details.code === "string" || typeof details.code === "number" ? String(details.code) : undefined,
      status: typeof details.status === "number" || typeof details.status === "string" ? String(details.status) : undefined
    });
    throw error;
  }

  return <PartnerAccessStateLayout portalData={portalData} />;
}
