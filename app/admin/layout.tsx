import { AdminDemoGate } from "@/components/admin/AdminDemoGate";
import { hasAdminSession } from "@/lib/admin/adminAuth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  console.info("[prod-auth-debug] admin-layout:start");
  let hasAccess: boolean;
  try {
    hasAccess = await hasAdminSession();
    console.info("[prod-auth-debug] admin-layout:has-access", { hasAccess });
  } catch (error) {
    const details = error && typeof error === "object" ? error as { name?: unknown; code?: unknown; status?: unknown } : {};
    console.error("[prod-auth-debug] admin-layout:threw", {
      name: typeof details.name === "string" ? details.name : error instanceof Error ? error.name : "UnknownError",
      code: typeof details.code === "string" || typeof details.code === "number" ? String(details.code) : undefined,
      status: typeof details.status === "number" || typeof details.status === "string" ? String(details.status) : undefined
    });
    throw error;
  }

  if (!hasAccess) {
    console.info("[prod-auth-debug] admin-layout:render-gate");
    return <AdminDemoGate />;
  }

  console.info("[prod-auth-debug] admin-layout:render-children");
  return children;
}
