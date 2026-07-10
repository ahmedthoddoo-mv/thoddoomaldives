import type { Metadata } from "next";
import { AdminCrmShell } from "@/components/admin/AdminCrmShell";
import { AdminCrmTasks } from "@/components/admin/AdminCrmTasks";

export const metadata: Metadata = {
  title: "Admin CRM Tasks",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminCrmTasksPage() {
  return (
    <AdminCrmShell>
      <AdminCrmTasks />
    </AdminCrmShell>
  );
}
