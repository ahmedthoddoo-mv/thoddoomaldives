import type { Metadata } from "next";
import { AdminCrmNotes } from "@/components/admin/AdminCrmNotes";
import { AdminCrmShell } from "@/components/admin/AdminCrmShell";
import { getLiveCrm } from "@/lib/repositories/liveReads";

export const metadata: Metadata = {
  title: "Admin CRM Notes",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminCrmNotesPage() {
  const crmRead = await getLiveCrm();
  return (
    <AdminCrmShell>
      {crmRead.error ? <section className="adminPanel"><p className="mutedText">{crmRead.error}</p></section> : null}
      <AdminCrmNotes notes={crmRead.data.notes} partners={crmRead.data.partners} />
    </AdminCrmShell>
  );
}
