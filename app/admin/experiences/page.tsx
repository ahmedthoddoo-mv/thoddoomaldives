import type { Metadata } from "next";
import { AdminContentPage } from "@/components/admin/AdminContentPage";
import { adminContentSections } from "@/data/adminContent";

export const metadata: Metadata = {
  title: "Admin Experiences",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminExperiencesPage() {
  return <AdminContentPage section={adminContentSections.experiences} />;
}
