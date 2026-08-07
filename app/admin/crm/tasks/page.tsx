import type { Metadata } from "next";
import { AdminCrmShell } from "@/components/admin/AdminCrmShell";
import { AdminCrmTasks } from "@/components/admin/AdminCrmTasks";
import { renderAdminGateIfUnauthenticated } from "@/app/admin/adminPageGuard";
import { getLiveCrm } from "@/lib/repositories/liveReads";

export const metadata: Metadata = {
  title: "Admin CRM Tasks",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminCrmTasksPage() {
  const gate = await renderAdminGateIfUnauthenticated();
  if (gate) return gate;

  const crmRead = await getLiveCrm();
  return (
    <AdminCrmShell>
      {crmRead.error ? <section className="adminPanel"><p className="mutedText">{crmRead.error}</p></section> : null}
      <AdminCrmTasks tasks={crmRead.data.tasks} />
    </AdminCrmShell>
  );
}
