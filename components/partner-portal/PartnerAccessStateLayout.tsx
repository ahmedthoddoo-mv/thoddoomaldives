import Link from "next/link";
import { signOutPartner } from "@/app/partner/auth/actions";
import { publicNavigationLinks } from "@/lib/navigation";
import { PartnerAccessStateCard } from "@/components/partner-portal/PartnerAccessStateCard";
import type { PartnerPortalData } from "@/lib/partner-portal/partnerAccess";

function getInitials(value: string) {
  return (
    value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "IP"
  );
}

export function PartnerAccessStateLayout({ portalData }: { portalData: PartnerPortalData }) {
  const accountName = portalData.profile.businessName || "Partner account";
  const accountInitials = getInitials(accountName);
  const navigationLinks = Array.isArray(publicNavigationLinks) ? publicNavigationLinks : [];

  return (
    <main className="partnerAccessPage">
      <header className="partnerAccessTopNav">
        <div className="partnerAccessTopBar">
          <Link href="/" className="partnerAccessBrand" aria-label="iThoddoo Maldives home">
            <span aria-hidden="true">iT</span>
            <strong>iThoddoo Maldives</strong>
          </Link>

          <nav className="partnerAccessPublicNav" aria-label="Public navigation">
            {navigationLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="partnerAccessAccount">
            <details className="partnerAccessAccountMenu">
              <summary aria-label="Open account menu">
                <span className="partnerAccessAvatar" aria-hidden="true">
                  {accountInitials}
                </span>
                <span className="partnerAccessAccountLabel">{accountName}</span>
              </summary>
              <div className="partnerAccessAccountPanel">
                <p>{portalData.membership.plan}</p>
                <p>{portalData.verification.status}</p>
                <Link href="/partner/login">Partner sign in</Link>
                <form action={signOutPartner}>
                  <button type="submit">Sign out</button>
                </form>
              </div>
            </details>
          </div>
        </div>

        <details className="partnerAccessMobileMenu">
          <summary>Menu</summary>
          <nav aria-label="Mobile public navigation">
            {navigationLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </details>
      </header>

      <div className="partnerAccessContent">
        <PartnerAccessStateCard portalData={portalData} />
      </div>
    </main>
  );
}
