import Link from "next/link";
import { partnerNavigation } from "@/data/partnerPortal";
import { signOutPartner } from "@/app/partner/auth/actions";
import type { PartnerPortalData } from "@/lib/partner-portal/partnerAccess";
import { PartnerAccessStateCard } from "@/components/partner-portal/PartnerAccessStateCard";

type PartnerPortalShellProps = {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  portalData?: PartnerPortalData;
  allowRestrictedContent?: boolean;
};

export function PartnerPortalShell({ children, title, subtitle, portalData, allowRestrictedContent = false }: PartnerPortalShellProps) {
  const businessName = portalData?.profile.businessName ?? "Partner account";
  const restricted = portalData?.source === "setup_required" || portalData?.source === "fallback" || portalData?.source === "pending" || portalData?.source === "rejected" || portalData?.source === "suspended" || portalData?.source === "access_denied" || portalData?.source === "mock";
  const logo =
    businessName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "IP";

  return (
    <main className="partnerPortal">
      <div className="partnerPortalFrame">
        <aside className="partnerPortalSidebar" aria-label="Partner portal navigation">
          <Link className="partnerPortalBrand" href="/partner/dashboard" aria-label="Partner dashboard home">
            <span>{logo}</span>
            <strong>Partner Portal</strong>
          </Link>
          {!restricted ? (
            <nav>
              {partnerNavigation.map((item) => (
                <a href={item.href} key={item.label}>
                  {item.label}
                </a>
              ))}
            </nav>
          ) : null}
        </aside>
        <div className="partnerPortalMain">
          <header className="partnerPortalHeader">
            <div>
              <p className="eyebrow">{businessName}</p>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
            <div className="partnerPortalHeaderBadges">
              <span>{portalData?.membership.plan ?? "Free"}</span>
              <span>{portalData?.verification.status ?? "Missing"}</span>
              <span>{portalData?.source === "supabase" ? "Live" : restricted ? "Restricted" : "Setup required"}</span>
              <form action={signOutPartner}>
                <button type="submit">Sign out</button>
              </form>
            </div>
          </header>
          {restricted ? (
            <>
              <PartnerAccessStateCard portalData={portalData!} />
              {allowRestrictedContent ? children : null}
            </>
          ) : (
            children
          )}
          </div>
      </div>
    </main>
  );
}
