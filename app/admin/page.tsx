import type { Metadata } from "next";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { NavigationCard } from "@/components/admin/NavigationCard";
import { QuickActions } from "@/components/admin/QuickActions";
import { RecentApplications } from "@/components/admin/RecentApplications";
import { RecentPartners } from "@/components/admin/RecentPartners";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: {
    index: false,
    follow: false
  }
};

const dashboardStats = [
  {
    label: "Pending Partner Applications",
    value: "12",
    detail: "4 need review today",
    tone: "coral" as const
  },
  {
    label: "Verified Partners",
    value: "28",
    detail: "Across 7 business categories",
    tone: "green" as const
  },
  {
    label: "Guesthouses",
    value: "14",
    detail: "9 verified, 5 pending"
  },
  {
    label: "Restaurants",
    value: "6",
    detail: "3 ready for content refresh",
    tone: "gold" as const
  },
  {
    label: "Excursions",
    value: "9",
    detail: "Snorkeling, fishing, sandbank"
  },
  {
    label: "Transfer Companies",
    value: "4",
    detail: "2 premium transfer partners",
    tone: "green" as const
  },
  {
    label: "Website Pages",
    value: "19",
    detail: "Static pages generated"
  },
  {
    label: "Today's WhatsApp Leads",
    value: "23",
    detail: "Demo lead count",
    tone: "gold" as const
  }
];

const quickActions = [
  { label: "Add Guesthouse", href: "#add-guesthouse", variant: "primary" as const },
  { label: "Add Restaurant", href: "#add-restaurant" },
  { label: "Add Excursion", href: "#add-excursion" },
  { label: "Add Transfer Company", href: "#add-transfer" },
  { label: "Review Applications", href: "#applications", variant: "primary" as const },
  { label: "Upload Photos", href: "#media" }
];

const recentApplications = [
  {
    business: "Palm Garden Thoddoo",
    type: "Guesthouse",
    plan: "Verified",
    status: "Pending review",
    date: "Jul 9, 2026"
  },
  {
    business: "Lagoon Bite Cafe",
    type: "Restaurant",
    plan: "Free",
    status: "Needs photos",
    date: "Jul 8, 2026"
  },
  {
    business: "Blue Channel Transfers",
    type: "Speedboat",
    plan: "Premium",
    status: "Ready to verify",
    date: "Jul 7, 2026"
  },
  {
    business: "North Reef Adventures",
    type: "Excursion",
    plan: "Verified",
    status: "In review",
    date: "Jul 6, 2026"
  }
];

const recentPartners = [
  {
    name: "Thoddoo Sun Sky Inn",
    status: "Verified",
    joined: "Joined July 2026",
    category: "Guesthouse"
  },
  {
    name: "Blue Channel Speedboat",
    status: "Premium",
    joined: "Joined July 2026",
    category: "Transfer Company"
  },
  {
    name: "Island Bites",
    status: "Verified",
    joined: "Joined July 2026",
    category: "Restaurant"
  }
];

const systemStatuses = [
  {
    title: "SEO",
    value: "Healthy",
    description: "Metadata and structured content are ready for demo review."
  },
  {
    title: "Sitemap",
    value: "Healthy",
    description: "Static sitemap route is available and build verified."
  },
  {
    title: "Robots",
    value: "Healthy",
    description: "Crawler rules are configured for the public website."
  },
  {
    title: "Partner Program",
    value: "Healthy",
    description: "Plans, onboarding, and partner examples are connected."
  },
  {
    title: "Website",
    value: "Healthy",
    description: "Public pages are available as static demo surfaces."
  }
];

const roadmapGroups = [
  {
    title: "Current Project",
    items: ["Project Atlas"]
  },
  {
    title: "Completed",
    items: ["Homepage", "SEO", "Partner Program", "Onboarding"]
  },
  {
    title: "In Progress",
    items: ["Admin Dashboard"]
  },
  {
    title: "Upcoming",
    items: ["Booking Engine", "AI Concierge", "Analytics", "Mobile App"]
  }
];

export default function AdminPage() {
  return (
    <main className="adminShell">
      <section className="adminHero">
        <div>
          <p className="eyebrow">Internal dashboard</p>
          <h1>iThoddoo Maldives Admin</h1>
          <p>Business Control Center</p>
        </div>
        <aside className="adminHeroPanel" aria-label="Dashboard environment">
          <span>Demo mode</span>
          <strong>UI only</strong>
          <p>No login, database, API, payments, or authentication are connected.</p>
        </aside>
      </section>

      <div className="adminContent">
        <DashboardStats stats={dashboardStats} />

        <QuickActions actions={quickActions} />

        <div className="adminTwoColumn" id="applications">
          <RecentApplications applications={recentApplications} />
          <RecentPartners partners={recentPartners} />
        </div>

        <section className="adminPanel">
          <div className="adminSectionHeader">
            <p className="eyebrow">System status</p>
            <h2>Operational readiness</h2>
          </div>
          <div className="adminStatusGrid">
            {systemStatuses.map((status) => (
              <NavigationCard key={status.title} {...status} />
            ))}
          </div>
        </section>

        <section className="adminRoadmapPanel">
          <div className="adminSectionHeader">
            <p className="eyebrow">Roadmap</p>
            <h2>Project Atlas delivery map</h2>
          </div>
          <div className="adminRoadmapGrid">
            {roadmapGroups.map((group) => (
              <article className="adminRoadmapGroup" key={group.title}>
                <h3>{group.title}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
