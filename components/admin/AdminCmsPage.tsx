import { AdminCmsList } from "@/components/admin/AdminCmsList";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";
import type { AdminCmsSectionConfig } from "@/data/adminCms";

type AdminCmsPageProps = {
  section: AdminCmsSectionConfig;
};

export function AdminCmsPage({ section }: AdminCmsPageProps) {
  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <AdminCmsList section={section} />
      </div>
    </AdminShell>
  );
}
