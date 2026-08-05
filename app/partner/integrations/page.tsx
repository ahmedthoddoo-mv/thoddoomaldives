import type { Metadata } from "next";
import { AvailabilityIntegrationSettings } from "@/components/partner-portal/AvailabilityIntegrationSettings";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";
import { getCurrentPartnerPortalData } from "@/lib/partner-portal/partnerAccess";
import { getPartnerOperationsData } from "@/lib/partner-portal/partnerOperations";
export const metadata: Metadata = { title: "Availability Integrations", robots: { index: false, follow: false } };
export default async function PartnerIntegrationsPage(){ const [portalData,operations]=await Promise.all([getCurrentPartnerPortalData(),getPartnerOperationsData()]); return <PartnerPortalShell portalData={portalData} title="Availability integrations" subtitle="Choose manual inventory or prepare a supported provider connection."><AvailabilityIntegrationSettings initialProvider={operations.provider} /></PartnerPortalShell>; }
