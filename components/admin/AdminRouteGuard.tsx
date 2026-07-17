"use client";

import { usePathname } from "next/navigation";
import { AdminDemoGate } from "@/components/admin/AdminDemoGate";

type AdminRouteGuardProps = {
  hasAccess: boolean;
  children: React.ReactNode;
};

export function AdminRouteGuard({ hasAccess, children }: AdminRouteGuardProps) {
  const pathname = usePathname();

  if (!hasAccess && pathname !== "/admin/login") {
    return <AdminDemoGate />;
  }

  return <>{children}</>;
}
