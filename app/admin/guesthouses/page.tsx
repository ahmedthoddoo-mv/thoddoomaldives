import type { Metadata } from "next";
import { AdminContentPage } from "@/components/admin/AdminContentPage";
import { adminContentSections } from "@/data/adminContent";

export const metadata: Metadata = {
  title: "Admin Guesthouses",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminGuesthousesPage() {
  return <AdminContentPage section={adminContentSections.guesthouses} />;
}
