import type { Metadata } from "next";
import { AdminCrmOverview } from "@/components/admin/AdminCrmOverview";
import { AdminCrmShell } from "@/components/admin/AdminCrmShell";

export const metadata: Metadata = {
  title: "Admin CRM",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminCrmPage() {
  return (
    <AdminCrmShell>
      <AdminCrmOverview />
    </AdminCrmShell>
  );
}
