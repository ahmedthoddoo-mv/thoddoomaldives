import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminQuickActions } from "@/components/admin/AdminQuickActions";
import { AdminRecentApplications } from "@/components/admin/AdminRecentApplications";
import { AdminRecentPartners } from "@/components/admin/AdminRecentPartners";
import { AdminRoadmapPanel } from "@/components/admin/AdminRoadmapPanel";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminSystemStatus } from "@/components/admin/AdminSystemStatus";
import { DashboardStats } from "@/components/admin/DashboardStats";

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

const sidebarItems = [
  { label: "Overview", href: "#overview" },
  { label: "Actions", href: "#actions" },
  { label: "Applications", href: "#applications" },
  { label: "Partners", href: "#partners" },
  { label: "System", href: "#status" },
  { label: "Roadmap", href: "#roadmap" }
];

export default function AdminPage() {
  return (
    <AdminShell sidebar={<AdminSidebar items={sidebarItems} />}>
      <div className="adminContent" id="overview">
        <AdminHeader />

        <DashboardStats stats={dashboardStats} />

        <AdminQuickActions actions={quickActions} />

        <div className="adminTwoColumn">
          <AdminRecentApplications applications={recentApplications} />
          <AdminRecentPartners partners={recentPartners} />
        </div>

        <AdminSystemStatus statuses={systemStatuses} />

        <AdminRoadmapPanel groups={roadmapGroups} />
      </div>
    </AdminShell>
  );
}
