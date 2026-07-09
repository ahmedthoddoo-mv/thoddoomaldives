import type { Metadata } from "next";
import { AdminContentPage } from "@/components/admin/AdminContentPage";
import { adminContentSections } from "@/data/adminContent";

export const metadata: Metadata = {
  title: "Admin Media",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminMediaPage() {
  return <AdminContentPage section={adminContentSections.media} />;
}
