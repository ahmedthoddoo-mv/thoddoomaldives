import type { Metadata } from "next";
import { ApplicationReviewQueue } from "@/components/admin/ApplicationReviewQueue";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";
import { getPartnerApplicationsForAdmin } from "@/lib/applications/partnerApplicationReads";

export const metadata: Metadata = {
  title: "Admin Applications",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminApplicationsPage() {
  const applicationRead = await getPartnerApplicationsForAdmin();

  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <ApplicationReviewQueue
          initialApplications={applicationRead.applications}
          dataSource={applicationRead.source}
          readError={applicationRead.error}
        />
      </div>
    </AdminShell>
  );
}
