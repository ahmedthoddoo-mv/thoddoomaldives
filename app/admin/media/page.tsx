import type { Metadata } from "next";
import { AdminMediaLibrary } from "@/components/admin/AdminMediaLibrary";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";
import { MediaRepository } from "@/lib/repositories";

export const metadata: Metadata = {
  title: "Admin Media",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminMediaPage() {
  const mediaAssets = MediaRepository.findAll();

  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <AdminMediaLibrary assets={mediaAssets} />
      </div>
    </AdminShell>
  );
}
