import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";

export function AdminProtectedPage({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">{children}</div>
    </AdminShell>
  );
}
