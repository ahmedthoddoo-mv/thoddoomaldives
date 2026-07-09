import type { Metadata } from "next";
import { AdminContentPage } from "@/components/admin/AdminContentPage";
import { adminContentSections } from "@/data/adminContent";

export const metadata: Metadata = {
  title: "Admin Restaurants",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminRestaurantsPage() {
  return <AdminContentPage section={adminContentSections.restaurants} />;
}
