import { AdminDemoGate } from "@/components/admin/AdminDemoGate";
import { hasAdminDemoSession } from "@/lib/admin/adminAuth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const hasAccess = await hasAdminDemoSession();

  if (!hasAccess) {
    return <AdminDemoGate />;
  }

  return children;
}
