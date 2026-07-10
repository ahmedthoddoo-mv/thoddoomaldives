import type { Metadata } from "next";
import { AdminCmsForm } from "@/components/admin/AdminCmsForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";
import { getAdminCmsSection } from "@/data/adminCms";

export const metadata: Metadata = {
  title: "Add Transfer",
  robots: { index: false, follow: false }
};

export default function NewTransferPage() {
  const section = getAdminCmsSection("transfers");

  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <AdminCmsForm mode="new" section={section} />
      </div>
    </AdminShell>
  );
}
