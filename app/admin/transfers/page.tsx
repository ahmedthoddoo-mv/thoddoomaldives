import type { Metadata } from "next";
import { AdminCmsPage } from "@/components/admin/AdminCmsPage";
import { getAdminCmsSection } from "@/data/adminCms";

export const metadata: Metadata = {
  title: "Admin Transfers",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminTransfersPage() {
  return <AdminCmsPage section={getAdminCmsSection("transfers")} />;
}
