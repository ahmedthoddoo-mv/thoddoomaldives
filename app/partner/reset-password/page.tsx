import type { Metadata } from "next";
import { PartnerResetPasswordForm } from "@/components/partner-portal/PartnerAuthForms";

export const metadata: Metadata = {
  title: "Partner Reset Password"
};

export default function PartnerResetPasswordPage() {
  return (
    <main className="partnerAuthPage">
      <section className="partnerAuthCard">
        <p className="eyebrow">Partner Portal</p>
        <h1>Set a new password</h1>
        <p>Use the latest Supabase reset email link. Tokens are handled by the form and are not stored in client code.</p>
        <PartnerResetPasswordForm />
      </section>
    </main>
  );
}
