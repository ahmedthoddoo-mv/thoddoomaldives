"use client";

import { FormEvent, useState } from "react";

type AdminDemoGateProps = {
  children: React.ReactNode;
};

export function AdminDemoGate({ children }: AdminDemoGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const demoPassword = process.env.NEXT_PUBLIC_ADMIN_DEMO_PASSWORD;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!demoPassword) {
      setError("Admin demo password is not configured.");
      return;
    }

    if (password === demoPassword) {
      setHasAccess(true);
      setError("");
      return;
    }

    setError("Incorrect password. Please try again.");
  }

  if (hasAccess) {
    return children;
  }

  return (
    <main className="adminGateShell">
      <section className="adminGateCard" aria-labelledby="admin-gate-title">
        <p className="eyebrow">Internal demo</p>
        <h1 id="admin-gate-title">Admin access required</h1>
        <p>
          Enter the temporary demo password to view the iThoddoo Maldives admin dashboard.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-demo-password">Demo password</label>
          <input
            id="admin-demo-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
          {error ? <span role="alert">{error}</span> : null}
          <button type="submit">Unlock admin demo</button>
        </form>

        <small>
          This is temporary demo protection only. Replace with real authentication before production.
          Access is not remembered, so admin pages ask for the password each visit.
        </small>
      </section>
    </main>
  );
}
