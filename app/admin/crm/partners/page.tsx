import type { Metadata } from "next";
import { AdminCrmPartners } from "@/components/admin/AdminCrmPartners";
import { AdminCrmShell } from "@/components/admin/AdminCrmShell";

export const metadata: Metadata = {
  title: "Admin CRM Partners",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminCrmPartnersPage() {
  return (
    <AdminCrmShell>
      <AdminCrmPartners />
    </AdminCrmShell>
  );
}
