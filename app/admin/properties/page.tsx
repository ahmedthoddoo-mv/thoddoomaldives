import type { Metadata } from "next";
import { AdminPropertyImportPreview } from "@/components/admin/AdminPropertyImportPreview";
import { AdminPropertyManager } from "@/components/admin/AdminPropertyManager";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminPropertyActions, adminSidebarItems } from "@/data/adminContent";
import { PropertyRepository } from "@/lib/repositories";

export const metadata: Metadata = {
  title: "Admin Properties",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminPropertiesPage() {
  const properties = PropertyRepository.findAll();

  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <AdminPropertyManager actions={adminPropertyActions} properties={properties} />
        <AdminPropertyImportPreview />
      </div>
    </AdminShell>
  );
}
