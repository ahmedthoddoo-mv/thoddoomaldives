import type { Metadata } from "next";
import { AdminBookingManagement } from "@/components/booking/AdminBookingManagement";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminBookings } from "@/data/bookings";
import { adminSidebarItems } from "@/data/adminContent";

export const metadata: Metadata = {
  title: "Admin Bookings",
  robots: { index: false, follow: false }
};

export default function AdminBookingsPage() {
  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <AdminBookingManagement bookings={adminBookings} />
      </div>
    </AdminShell>
  );
}
