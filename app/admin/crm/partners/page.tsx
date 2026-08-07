import type { Metadata } from "next";
import { AdminCrmPartners } from "@/components/admin/AdminCrmPartners";
import { AdminCrmShell } from "@/components/admin/AdminCrmShell";
import { renderAdminGateIfUnauthenticated } from "@/app/admin/adminPageGuard";
import { getLiveCrm } from "@/lib/repositories/liveReads";

export const metadata: Metadata = {
  title: "Admin CRM Partners",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminCrmPartnersPage() {
  const gate = await renderAdminGateIfUnauthenticated();
  if (gate) return gate;

  const crmRead = await getLiveCrm();
  return (
    <AdminCrmShell>
      {crmRead.error ? <section className="adminPanel"><p className="mutedText">{crmRead.error}</p></section> : null}
      <AdminCrmPartners partners={crmRead.data.partners} />
    </AdminCrmShell>
  );
}
