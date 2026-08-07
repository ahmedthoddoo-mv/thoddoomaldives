import type { Metadata } from "next";
import { AdminCrmOverview } from "@/components/admin/AdminCrmOverview";
import { AdminCrmShell } from "@/components/admin/AdminCrmShell";
import { renderAdminGateIfUnauthenticated } from "@/app/admin/adminPageGuard";
import { getLiveCrm } from "@/lib/repositories/liveReads";

export const metadata: Metadata = {
  title: "Admin CRM",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminCrmPage() {
  const gate = await renderAdminGateIfUnauthenticated();
  if (gate) return gate;

  const crmRead = await getLiveCrm();
  return (
    <AdminCrmShell>
      {crmRead.error ? <section className="adminPanel"><p className="mutedText">{crmRead.error}</p></section> : null}
      <AdminCrmOverview {...crmRead.data} />
    </AdminCrmShell>
  );
}
