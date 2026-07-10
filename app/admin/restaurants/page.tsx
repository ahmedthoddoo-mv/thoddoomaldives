import type { Metadata } from "next";
import { AdminCmsPage } from "@/components/admin/AdminCmsPage";
import { getAdminCmsSection } from "@/data/adminCms";

export const metadata: Metadata = {
  title: "Admin Restaurants",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminRestaurantsPage() {
  return <AdminCmsPage section={getAdminCmsSection("restaurants")} />;
}
