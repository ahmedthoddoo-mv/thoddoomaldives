import Link from "next/link";
import { platformConfig } from "@/lib/config/platform";
import type { PartnerPortalData } from "@/lib/partner-portal/partnerAccess";

function getStateCopy(source: PartnerPortalData["source"]) {
  if (source === "pending") {
    return {
      eyebrow: "Pending review",
      title: "Your partner account is under review",
      body:
        "The iThoddoo Maldives team is checking your business details, verification documents, and listing information. We will email you once the review is complete.",
      actionHref: "/partner/support",
      actionLabel: "Contact support",
      nextSteps:
        "Keep an eye on your inbox for review updates. If your business details changed, message support with your latest information."
    };
  }
  if (source === "rejected") {
    return {
      eyebrow: "Application not approved",
      title: "This partner account was not approved",
      body:
        "Please review the feedback, contact the team for clarification, or submit a fresh application if your business details have changed.",
      actionHref: "/partner/support",
      actionLabel: "Contact support",
      nextSteps:
        "Reply to the latest review feedback with clarifications or updated documents before starting a new submission."
    };
  }
  if (source === "suspended") {
    return {
      eyebrow: "Account suspended",
      title: "This partner account is currently suspended",
      body:
        "Access is paused until the team reviews the account. Please contact support for the next steps.",
      actionHref: "/partner/support",
      actionLabel: "Contact support",
      nextSteps:
        "Support can explain the suspension reason and share the exact compliance steps required to restore access."
    };
  }
  if (source === "access_denied") {
    return {
      eyebrow: "Access denied",
      title: "Access denied",
      body:
        "The signed-in Supabase account does not have an approved partner record yet. Ask the iThoddoo Maldives admin team to link the correct business profile.",
      actionHref: "/partner/login",
      actionLabel: "Sign in again",
      nextSteps:
        "Sign in again with the approved partner email, or ask support to link your current login to the correct partner record."
    };
  }
  if (source === "setup_required") {
    return {
      eyebrow: "Account setup required",
      title: "Your account is waiting for partner setup",
      body:
        "This signed-in account needs a linked property or listing before the dashboard can show business tools.",
      actionHref: "/partner/support",
      actionLabel: "Contact support",
      nextSteps:
        "Share your business name and expected listing URL so the operations team can complete account setup."
    };
  }
  if (source === "fallback") {
    return {
      eyebrow: "Data unavailable",
      title: "We could not load your live partner data",
      body:
        "Please retry later. No fallback business records were loaded, so nothing private has been shown.",
      actionHref: "/partner/support",
      actionLabel: "Contact support",
      nextSteps: "Retry shortly and contact support if the issue persists."
    };
  }
  return {
    eyebrow: "Demo mode",
    title: "Partner sign-in is running in demo mode",
    body:
      "Live Supabase partner access is not configured in this environment. Configure the production credentials to continue.",
    actionHref: "/partner/support",
    actionLabel: "Open support",
    nextSteps: "Switch this environment to live Supabase mode to use partner authentication."
  };
}

export function PartnerAccessStateCard({ portalData }: { portalData: PartnerPortalData }) {
  const state = getStateCopy(portalData.source);

  return (
    <div className="partnerAccessStack">
      <section className="partnerAccessHeroCard" role="alert" aria-live="polite">
        <span className="partnerAccessIcon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M12 2 4 6v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V6l-8-4Zm0 3.2 5 2.5V12c0 3.6-2.2 7.1-5 8.3-2.8-1.2-5-4.7-5-8.3V7.7l5-2.5Zm0 2.8a2.8 2.8 0 0 0-2.8 2.8v1.1h-1.1v4.8h7.8v-4.8h-1.1v-1.1A2.8 2.8 0 0 0 12 8Zm-1.1 2.8a1.1 1.1 0 1 1 2.2 0v1.1h-2.2v-1.1Z" />
          </svg>
        </span>
        <p className="eyebrow">{state.eyebrow}</p>
        <h1>{state.title}</h1>
        <p>{state.body}</p>
      </section>

      <section className="partnerAccessDetailCard" aria-label="Account support actions">
        <h2>What you can do next</h2>
        <p>{state.nextSteps}</p>
        <div className="partnerAccessMeta">
          <span>Plan: {portalData.membership.plan}</span>
          <span>Verification: {portalData.verification.status}</span>
          <span>Status: {portalData.membership.status}</span>
        </div>
        <div className="partnerAccessActions">
          <Link href={state.actionHref}>{state.actionLabel}</Link>
          <a href={`mailto:${platformConfig.companyContact.email}`}>Email support</a>
        </div>
      </section>
    </div>
  );
}
