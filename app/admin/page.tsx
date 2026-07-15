import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminApplicationStats } from "@/components/admin/AdminApplicationStats";
import { AdminQuickActions } from "@/components/admin/AdminQuickActions";
import { AdminPlatformIntegrationPanel } from "@/components/admin/AdminPlatformIntegrationPanel";
import { AdminRecentApplications } from "@/components/admin/AdminRecentApplications";
import { AdminRecentPartners } from "@/components/admin/AdminRecentPartners";
import { AdminRoadmapPanel } from "@/components/admin/AdminRoadmapPanel";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminSystemStatus } from "@/components/admin/AdminSystemStatus";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { adminQuickActions, adminSidebarItems } from "@/data/adminContent";
import { getPartnerApplicationsForAdmin } from "@/lib/applications/partnerApplicationReads";
import { calculateAdminMetrics } from "@/lib/platform/metrics";
import { getSupabaseHealthCheck } from "@/lib/supabase/health";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: {
    index: false,
    follow: false
  }
};

const adminMetrics = calculateAdminMetrics();

const dashboardStats = [
  {
    label: "Pending Partner Applications",
    value: String(adminMetrics.pendingApplications),
    detail: "CRM records needing approval",
    tone: "coral" as const
  },
  {
    label: "Verified Partners",
    value: String(adminMetrics.recentPartners - adminMetrics.pendingApplications),
    detail: "Derived from CRM verification",
    tone: "green" as const
  },
  {
    label: "Guesthouses",
    value: String(adminMetrics.publishedProperties),
    detail: "Published property records"
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
    value: "63",
    detail: "Static pages generated in build"
  },
  {
    label: "Open CRM Tasks",
    value: String(adminMetrics.openTasks),
    detail: "Calls, photos, pricing, responses",
    tone: "gold" as const
  }
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

const roadmapGroups = [
  {
    title: "Current Project",
    items: ["Project Atlas"]
  },
  {
    title: "Completed",
    items: ["Homepage", "SEO", "Partner Program", "Onboarding", "Booking Engine", "Admin CMS", "Media Library", "Partner Portal", "CRM"]
  },
  {
    title: "In Progress",
    items: ["Platform Integration"]
  },
  {
    title: "Upcoming",
    items: ["Database Schema", "Authentication", "AI Concierge", "Analytics", "Mobile App"]
  }
];

export default async function AdminPage() {
  const supabaseHealth = await getSupabaseHealthCheck();
  const applicationRead = await getPartnerApplicationsForAdmin();
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
    },
    {
      title: "Data Mode",
      value: supabaseHealth.dataMode === "supabase" ? "Supabase" : "Mock",
      description: "Controlled by NEXT_PUBLIC_DATA_MODE with mock as the safe default."
    },
    {
      title: "Supabase",
      value: supabaseHealth.configured ? "Configured" : "Not configured",
      description: "Public URL and anon key presence only. No secrets are shown."
    },
    {
      title: "Database",
      value: supabaseHealth.reachable ? "Reachable" : "Demo status",
      description: `${supabaseHealth.message} Migration version ${supabaseHealth.migrationVersion}.`
    }
  ];

  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent" id="overview">
        <AdminHeader />

        <DashboardStats stats={dashboardStats} />

        <AdminQuickActions actions={adminQuickActions} />

        <AdminApplicationStats initialApplications={applicationRead.applications} />

        <AdminPlatformIntegrationPanel />

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
