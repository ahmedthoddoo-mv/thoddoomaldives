"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAdminDemo, type AdminLoginState } from "@/app/admin/actions";

function AdminGateSubmitButton() {
  const { pending } = useFormStatus();

  return <button type="submit">{pending ? "Checking..." : "Unlock admin demo"}</button>;
}

export function AdminDemoGate() {
  const initialState: AdminLoginState = {};
  const [state, formAction] = useActionState(loginAdminDemo, initialState);

  return (
    <main className="adminGateShell">
      <section className="adminGateCard" aria-labelledby="admin-gate-title">
        <p className="eyebrow">Internal demo</p>
        <h1 id="admin-gate-title">Admin access required</h1>
        <p>
          Enter the temporary demo password to view the iThoddoo Maldives admin dashboard.
        </p>

        <form action={formAction}>
          <label htmlFor="admin-demo-password">Demo password</label>
          <input
            id="admin-demo-password"
            name="password"
            type="password"
            autoComplete="current-password"
          />
          {state.error ? <span role="alert">{state.error}</span> : null}
          <AdminGateSubmitButton />
        </form>

        <small>
          This is temporary demo protection only. Replace with real authentication before production.
          Access is stored in an HttpOnly demo session cookie and expires automatically.
        </small>
      </section>
    </main>
  );
}
