import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { PartnerDashboardDemo } from "@/components/booking/PartnerDashboardDemo";
import { adminSidebarItems } from "@/data/adminContent";

export const metadata: Metadata = {
  title: "Partner Property Dashboard",
  robots: { index: false, follow: false }
};

export default function AdminPropertyDashboardPage() {
  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <PartnerDashboardDemo />
      </div>
    </AdminShell>
  );
}
