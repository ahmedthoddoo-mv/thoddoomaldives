import type { Metadata } from "next";
import { AdminBusinessEditor } from "@/components/admin/AdminBusinessEditor";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";

export const metadata: Metadata = {
  title: "Add Restaurant",
  robots: { index: false, follow: false }
};

export default function NewRestaurantPage() {
  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <AdminBusinessEditor kind="restaurant" />
      </div>
    </AdminShell>
  );
}
