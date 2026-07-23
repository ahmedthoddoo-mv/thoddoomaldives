import { AdminDemoGate } from "@/components/admin/AdminDemoGate";
import { hasAdminSession } from "@/lib/admin/adminAuth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const hasAccess = await hasAdminSession();

  if (!hasAccess) {
    return <AdminDemoGate />;
  }

  return children;
}
