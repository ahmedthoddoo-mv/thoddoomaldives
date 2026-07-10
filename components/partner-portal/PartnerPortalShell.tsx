import { partnerNavigation, partnerProfile } from "@/data/partnerPortal";

type PartnerPortalShellProps = {
  children: React.ReactNode;
  title: string;
  subtitle: string;
};

export function PartnerPortalShell({ children, title, subtitle }: PartnerPortalShellProps) {
  return (
    <main className="partnerPortal">
      <div className="partnerPortalFrame">
        <aside className="partnerPortalSidebar" aria-label="Partner portal navigation">
          <a className="partnerPortalBrand" href="/partner/dashboard" aria-label="Partner dashboard home">
            <span>{partnerProfile.logo}</span>
            <strong>Partner Portal</strong>
          </a>
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
              <p className="eyebrow">{partnerProfile.businessName}</p>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
            <div className="partnerPortalHeaderBadges">
              <span>{partnerProfile.membershipPlan}</span>
              <span>{partnerProfile.verificationStatus}</span>
            </div>
          </header>
          {children}
        </div>
      </div>
    </main>
  );
}
