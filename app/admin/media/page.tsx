import type { Metadata } from "next";
import { AdminMediaDirectory } from "@/components/admin/AdminMediaDirectory";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";
import { renderAdminGateIfUnauthenticated } from "@/app/admin/adminPageGuard";
import { getLiveMedia } from "@/lib/repositories/liveReads";

export const metadata: Metadata = {
  title: "Admin Media",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminMediaPage() {
  const gate = await renderAdminGateIfUnauthenticated();
  if (gate) return gate;

  const mediaRead = await getLiveMedia();

  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <AdminMediaDirectory assets={mediaRead.data} error={mediaRead.error} />
      </div>
    </AdminShell>
  );
}
