import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";
import { getLiveAdminProperties, getLiveBookings } from "@/lib/repositories/liveReads";
import { calculateBookingAnalytics } from "@/lib/bookings/bookingAnalytics";

export const metadata: Metadata = {
  title: "Partner Property Dashboard",
  robots: { index: false, follow: false }
};

export default async function AdminPropertyDashboardPage() {
  const [propertyRead, bookingRead] = await Promise.all([getLiveAdminProperties(), getLiveBookings()]);
  const analytics = calculateBookingAnalytics(bookingRead.data);
  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <section className="adminContentHero"><div><p className="eyebrow">Live operations</p><h1>Property Dashboard</h1><p>Database-derived property and enquiry totals.</p></div></section>
        {propertyRead.error || bookingRead.error ? <section className="adminPanel"><p className="mutedText">{propertyRead.error ?? bookingRead.error}</p></section> : null}
        <section className="adminStatsGrid">
          <article className="adminStatCard"><span>Properties</span><strong>{propertyRead.data.length}</strong><p>All live property records</p></article>
          <article className="adminStatCard"><span>Published</span><strong>{propertyRead.data.filter((item) => item.isPublished).length}</strong><p>Currently public</p></article>
          <article className="adminStatCard"><span>Enquiries</span><strong>{analytics.bookingRequests}</strong><p>Real booking records</p></article>
          <article className="adminStatCard"><span>Confirmed revenue</span><strong>${analytics.confirmedRevenue}</strong><p>Excludes unpriced and cancelled records</p></article>
        </section>
      </div>
    </AdminShell>
  );
}
