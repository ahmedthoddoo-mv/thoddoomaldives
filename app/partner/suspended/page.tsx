import type { Metadata } from "next";
import { PartnerAccessStateLayout } from "@/components/partner-portal/PartnerAccessStateLayout";
import { getCurrentPartnerPortalData } from "@/lib/partner-portal/partnerAccess";

export const metadata: Metadata = {
  title: "Partner Suspended"
};

export default async function PartnerSuspendedPage() {
  const portalData = await getCurrentPartnerPortalData();

  return <PartnerAccessStateLayout portalData={portalData} />;
}
