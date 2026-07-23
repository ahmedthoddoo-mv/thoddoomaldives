"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAdmin, type AdminLoginState } from "@/app/admin/actions";

function AdminGateSubmitButton() {
  const { pending } = useFormStatus();

  return <button type="submit">{pending ? "Signing in..." : "Sign in securely"}</button>;
}

export function AdminDemoGate() {
  const initialState: AdminLoginState = {};
  const [state, formAction] = useActionState(loginAdmin, initialState);

  return (
    <main className="adminGateShell">
      <section className="adminGateCard" aria-labelledby="admin-gate-title">
        <p className="eyebrow">Owner portal</p>
        <h1 id="admin-gate-title">Secure owner access</h1>
        <p>Sign in with your approved iThoddoo Maldives owner account.</p>

        <form action={formAction}>
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
          {state.error ? <span role="alert">{state.error}</span> : null}
          <AdminGateSubmitButton />
        </form>

        <small>Only approved owner and admin accounts can access this dashboard.</small>
      </section>
    </main>
  );
}
