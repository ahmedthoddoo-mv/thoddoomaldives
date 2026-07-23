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
import { getSupabaseHealthCheck } from "@/lib/supabase/health";

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
    value: "0",
    detail: "Live applications needing approval",
    tone: "coral" as const
  },
  {
    label: "Verified Partners",
    value: "0",
    detail: "Approved live records",
    tone: "green" as const
  },
  {
    label: "Real Businesses",
    value: "0",
    detail: "Live database records"
  },
  {
    label: "Restaurants",
    value: "0",
    detail: "No demo records",
    tone: "gold" as const
  },
  {
    label: "Excursions",
    value: "0",
    detail: "No demo records"
  },
  {
    label: "Transfer Companies",
    value: "0",
    detail: "No demo records",
    tone: "green" as const
  },
  {
    label: "Website Pages",
    value: "63",
    detail: "Static pages generated in build"
  },
  {
    label: "Open CRM Tasks",
    value: "0",
    detail: "Live follow-up tasks",
    tone: "gold" as const
  }
];

const recentApplications: [] = [];
const recentPartners: [] = [];

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
      description: "Metadata and structured content are configured."
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
      description: "Plans and onboarding are connected."
    },
    {
      title: "Website",
      value: "Healthy",
      description: "Public pages are available."
    },
    {
      title: "Data Mode",
      value: supabaseHealth.dataMode === "supabase" ? "Live database" : "Setup required",
      description: "Real business records require the live database."
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
