import { AdminDemoGate } from "@/components/admin/AdminDemoGate";
import { hasAdminSession } from "@/lib/admin/adminAuth";

export async function renderAdminGateIfUnauthenticated() {
  const hasAccess = await hasAdminSession();
  return hasAccess ? null : <AdminDemoGate />;
}
