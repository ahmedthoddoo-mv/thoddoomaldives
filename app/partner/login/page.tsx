import type { Metadata } from "next";
import { PartnerLoginForm } from "@/components/partner-portal/PartnerAuthForms";

export const metadata: Metadata = {
  title: "Partner Sign In"
};

type PartnerLoginPageProps = {
  searchParams?: Promise<{ next?: string }>;
};

export default async function PartnerLoginPage({ searchParams }: PartnerLoginPageProps) {
  const params = await searchParams;

  return (
    <main className="partnerAuthPage">
      <section className="partnerAuthCard">
        <p className="eyebrow">Partner Portal</p>
        <h1>Sign in to iThoddoo Maldives</h1>
        <p>Access your business dashboard, bookings, documents, and verification workflow.</p>
        <PartnerLoginForm next={params?.next} />
      </section>
    </main>
  );
}
