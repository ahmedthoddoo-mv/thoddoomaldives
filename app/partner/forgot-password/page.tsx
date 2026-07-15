import type { Metadata } from "next";
import { PartnerForgotPasswordForm } from "@/components/partner-portal/PartnerAuthForms";

export const metadata: Metadata = {
  title: "Partner Forgot Password"
};

export default function PartnerForgotPasswordPage() {
  return (
    <main className="partnerAuthPage">
      <section className="partnerAuthCard">
        <p className="eyebrow">Partner Portal</p>
        <h1>Reset partner password</h1>
        <p>Enter the email linked to your partner account. Supabase Auth will send the reset email.</p>
        <PartnerForgotPasswordForm />
      </section>
    </main>
  );
}
