import type { Metadata } from "next";
import { AdminCmsPage } from "@/components/admin/AdminCmsPage";
import { getAdminCmsSection } from "@/data/adminCms";

export const metadata: Metadata = {
  title: "Admin Guesthouses",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminGuesthousesPage() {
  return <AdminCmsPage section={getAdminCmsSection("guesthouses")} />;
}
