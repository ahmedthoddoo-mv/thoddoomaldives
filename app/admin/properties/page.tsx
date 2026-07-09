import type { Metadata } from "next";
import { AdminPropertyManager } from "@/components/admin/AdminPropertyManager";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminManagedProperties, adminPropertyActions, adminSidebarItems } from "@/data/adminContent";

export const metadata: Metadata = {
  title: "Admin Properties",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminPropertiesPage() {
  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <AdminPropertyManager actions={adminPropertyActions} properties={adminManagedProperties} />
      </div>
    </AdminShell>
  );
}
