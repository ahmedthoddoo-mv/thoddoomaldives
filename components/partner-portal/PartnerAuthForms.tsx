"use client";

import { useActionState, useMemo } from "react";
import {
  requestPartnerPasswordReset,
  resetPartnerPassword,
  signInPartner,
  type PartnerAuthFormState
} from "@/app/partner/auth/actions";

const initialState: PartnerAuthFormState = {
  ok: false,
  message: ""
};

export function PartnerLoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signInPartner, initialState);

  return (
    <form className="partnerAuthForm" action={action}>
      <input type="hidden" name="next" value={next ?? "/partner/dashboard"} />
      <label>
        <span>Email</span>
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        <span>Password</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      <button disabled={pending} type="submit">{pending ? "Signing in..." : "Sign in"}</button>
      {state.message ? <p className={state.ok ? "propertySaveStatus propertySaveStatusSuccess" : "bookingValidationPanel"}>{state.message}</p> : null}
      <a href="/partner/forgot-password">Forgot password?</a>
    </form>
  );
}

export function PartnerForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPartnerPasswordReset, initialState);

  return (
    <form className="partnerAuthForm" action={action}>
      <label>
        <span>Email</span>
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <button disabled={pending} type="submit">{pending ? "Requesting..." : "Send reset email"}</button>
      {state.message ? <p className={state.ok ? "propertySaveStatus propertySaveStatusSuccess" : "bookingValidationPanel"}>{state.message}</p> : null}
      <a href="/partner/login">Back to sign in</a>
    </form>
  );
}

export function PartnerResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPartnerPassword, initialState);
  const tokens = useMemo(() => {
    if (typeof window === "undefined") return { accessToken: "", refreshToken: "" };
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const queryParams = new URLSearchParams(window.location.search);
    return {
      accessToken: hashParams.get("access_token") ?? queryParams.get("access_token") ?? "",
      refreshToken: hashParams.get("refresh_token") ?? queryParams.get("refresh_token") ?? ""
    };
  }, []);

  return (
    <form className="partnerAuthForm" action={action}>
      <input type="hidden" name="access_token" value={tokens.accessToken} />
      <input type="hidden" name="refresh_token" value={tokens.refreshToken} />
      <label>
        <span>New password</span>
        <input name="password" type="password" autoComplete="new-password" minLength={8} required />
      </label>
      <label>
        <span>Confirm password</span>
        <input name="confirm_password" type="password" autoComplete="new-password" minLength={8} required />
      </label>
      <button disabled={pending} type="submit">{pending ? "Updating..." : "Update password"}</button>
      {state.message ? <p className={state.ok ? "propertySaveStatus propertySaveStatusSuccess" : "bookingValidationPanel"}>{state.message}</p> : null}
      {state.ok ? <a href="/partner/dashboard">Continue to dashboard</a> : null}
    </form>
  );
}
