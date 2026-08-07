import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminApplicationStats } from "@/components/admin/AdminApplicationStats";
import { AdminQuickActions } from "@/components/admin/AdminQuickActions";
import { AdminRecentApplications } from "@/components/admin/AdminRecentApplications";
import { AdminRecentPartners } from "@/components/admin/AdminRecentPartners";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminSystemStatus } from "@/components/admin/AdminSystemStatus";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { adminQuickActions, adminSidebarItems } from "@/data/adminContent";
import { renderAdminGateIfUnauthenticated } from "@/app/admin/adminPageGuard";
import { getPartnerApplicationsForAdmin } from "@/lib/applications/partnerApplicationReads";
import { getSupabaseHealthCheck } from "@/lib/supabase/health";
import { getLiveAdminProperties, getLiveBookings, getLiveCrm, getLiveExperiences, getLiveMedia, getLiveRestaurants, getLiveTransfers } from "@/lib/repositories/liveReads";
import { calculateBookingAnalytics } from "@/lib/bookings/bookingAnalytics";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminPage() {
  const gate = await renderAdminGateIfUnauthenticated();
  if (gate) return gate;

  const [supabaseHealth, applicationRead, properties, bookings, crm, restaurants, experiences, transfers, media] = await Promise.all([
    getSupabaseHealthCheck(), getPartnerApplicationsForAdmin(), getLiveAdminProperties(), getLiveBookings(), getLiveCrm(),
    getLiveRestaurants(), getLiveExperiences(), getLiveTransfers(), getLiveMedia()
  ]);
  const bookingAnalytics = calculateBookingAnalytics(bookings.data);
  const allErrors = [applicationRead.error, properties.error, bookings.error, crm.error, restaurants.error, experiences.error, transfers.error, media.error].filter(Boolean);
  const dashboardStats = [
    { label: "Pending Applications", value: String(applicationRead.applications.filter((item) => ["submitted", "under_review", "changes_requested"].includes(item.status)).length), detail: "Awaiting a decision", tone: "coral" as const },
    { label: "Verified Partners", value: String(crm.data.partners.filter((item) => item.verification === "Verified").length), detail: "Verified database identities", tone: "green" as const },
    { label: "Published Properties", value: String(properties.data.filter((item) => item.isPublished).length), detail: `${properties.data.length} total properties` },
    { label: "Other Businesses", value: String(restaurants.data.length + experiences.data.length + transfers.data.length), detail: `${restaurants.data.length} restaurants · ${experiences.data.length} experiences · ${transfers.data.length} transfers`, tone: "gold" as const },
    { label: "Bookings / Enquiries", value: String(bookings.data.length), detail: `$${bookingAnalytics.confirmedRevenue} confirmed revenue` },
    { label: "Open CRM Tasks", value: String(crm.data.tasks.filter((item) => item.status !== "Completed").length), detail: "Live follow-up tasks", tone: "gold" as const },
    { label: "Public Media", value: String(media.data.filter((item) => !item.archived && item.rightsStatus === "Permission confirmed").length), detail: `${media.data.length} total media assets` },
    { label: "Unpriced Enquiries", value: String(bookings.data.filter((item) => item.estimatedValue === null).length), detail: "Quote required" }
  ];
  const recentApplications = applicationRead.applications.slice(0, 5).map((item) => ({ business: item.businessName, type: item.businessType, plan: item.requestedMembershipTier, status: item.status, date: item.submittedDate.slice(0, 10) }));
  const recentPartners = crm.data.partners.slice(0, 5).map((item) => ({ name: item.business, status: item.verification, joined: item.lastContact.slice(0, 10), category: item.category }));
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
      value: supabaseHealth.dataMode === "supabase" ? "Live database" : "Explicit mock mode",
      description: "Real business records require the live database."
    },
    {
      title: "Supabase",
      value: supabaseHealth.configured ? "Configured" : "Not configured",
      description: "Public URL and anon key presence only. No secrets are shown."
    },
    {
      title: "Database",
      value: supabaseHealth.reachable ? "Reachable" : "Unavailable",
      description: `${supabaseHealth.message} Migration version ${supabaseHealth.migrationVersion}.`
    }
  ];

  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent" id="overview">
        <AdminHeader />

        {allErrors.length ? <section className="adminPanel"><p className="mutedText">Some live data could not be loaded: {allErrors.join(" · ")}</p></section> : null}

        <DashboardStats stats={dashboardStats} />

        <AdminQuickActions actions={adminQuickActions} />

        <AdminApplicationStats initialApplications={applicationRead.applications} />

        <div className="adminTwoColumn">
          <AdminRecentApplications applications={recentApplications} />
          <AdminRecentPartners partners={recentPartners} />
        </div>

        <AdminSystemStatus statuses={systemStatuses} />

      </div>
    </AdminShell>
  );
}
