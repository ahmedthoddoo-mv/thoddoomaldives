import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";

type AdminCrmShellProps = {
  children: React.ReactNode;
};

export function AdminCrmShell({ children }: AdminCrmShellProps) {
  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">{children}</div>
    </AdminShell>
  );
}
