import type { Metadata } from "next";
import { AdminPropertyImportPreview } from "@/components/admin/AdminPropertyImportPreview";
import { AdminPropertyManager } from "@/components/admin/AdminPropertyManager";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminPropertyActions, adminSidebarItems } from "@/data/adminContent";
import { getLiveAdminProperties } from "@/lib/repositories/liveReads";

export const metadata: Metadata = {
  title: "Admin Properties",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminPropertiesPage() {
  const propertyRead = await getLiveAdminProperties();
  const properties = propertyRead.data;

  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        {propertyRead.error ? (
          <section className="adminPanel">
            <p className="mutedText">{propertyRead.error}</p>
          </section>
        ) : null}
        <AdminPropertyManager actions={adminPropertyActions} properties={properties} />
        <AdminPropertyImportPreview />
      </div>
    </AdminShell>
  );
}
