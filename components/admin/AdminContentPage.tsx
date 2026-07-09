import { AdminContentManager } from "@/components/admin/AdminContentManager";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems, type AdminContentSection } from "@/data/adminContent";

type AdminContentPageProps = {
  section: AdminContentSection;
};

export function AdminContentPage({ section }: AdminContentPageProps) {
  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <AdminContentManager section={section} />
      </div>
    </AdminShell>
  );
}
