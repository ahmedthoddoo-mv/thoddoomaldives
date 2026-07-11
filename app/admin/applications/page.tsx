import type { Metadata } from "next";
import { ApplicationReviewQueue } from "@/components/admin/ApplicationReviewQueue";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";

export const metadata: Metadata = {
  title: "Admin Applications",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminApplicationsPage() {
  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <ApplicationReviewQueue />
      </div>
    </AdminShell>
  );
}
