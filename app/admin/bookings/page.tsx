import type { Metadata } from "next";
import { AdminBookingManagement } from "@/components/booking/AdminBookingManagement";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";
import { BookingRepository } from "@/lib/repositories";

export const metadata: Metadata = {
  title: "Admin Bookings",
  robots: { index: false, follow: false }
};

export default function AdminBookingsPage() {
  const bookings = BookingRepository.findAll();

  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <AdminBookingManagement bookings={bookings} />
      </div>
    </AdminShell>
  );
}
