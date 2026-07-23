import Link from "next/link";
import { partnerNavigation } from "@/data/partnerPortal";
import { signOutPartner } from "@/app/partner/auth/actions";
import type { PartnerPortalData } from "@/lib/partner-portal/partnerAccess";

type PartnerPortalShellProps = {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  portalData?: PartnerPortalData;
};

export function PartnerPortalShell({ children, title, subtitle, portalData }: PartnerPortalShellProps) {
  const businessName = portalData?.profile.businessName ?? "Partner account";
  const setupRequired = portalData?.source === "setup_required";
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
          <nav>
            {partnerNavigation.map((item) => (
              <a href={item.href} key={item.label}>
                {item.label}
              </a>
            ))}
          </nav>
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
              <span>{portalData?.source === "supabase" ? "Live" : "Setup required"}</span>
              <form action={signOutPartner}>
                <button type="submit">Sign out</button>
              </form>
            </div>
          </header>
          {setupRequired ? (
            <section className="partnerPortalPanel">
              <p className="eyebrow">Account setup required</p>
              <h2>Your login is not linked to a partner record yet.</h2>
              <p>
                Ask the iThoddoo Maldives admin team to link this Supabase Auth user to the correct partner record before
                managing business data.
              </p>
              <Link href="/partner/support">Contact support</Link>
            </section>
          ) : children}
        </div>
      </div>
    </main>
  );
}
