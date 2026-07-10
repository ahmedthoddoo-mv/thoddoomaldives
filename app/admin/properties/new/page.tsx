import type { Metadata } from "next";
import { AdminPropertyForm } from "@/components/admin/AdminPropertyForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";

export const metadata: Metadata = {
  title: "Add Admin Property",
  robots: {
    index: false,
    follow: false
  }
};

export default function NewAdminPropertyPage() {
  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <AdminPropertyForm mode="new" />
      </div>
    </AdminShell>
  );
}
