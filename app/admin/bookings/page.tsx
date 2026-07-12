import type { Metadata } from "next";
import { AdminBookingManagement } from "@/components/booking/AdminBookingManagement";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";
import { getLiveBookings } from "@/lib/repositories/liveReads";

export const metadata: Metadata = {
  title: "Admin Bookings",
  robots: { index: false, follow: false }
};

export default async function AdminBookingsPage() {
  const bookingRead = await getLiveBookings();

  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        {bookingRead.error ? (
          <section className="adminPanel">
            <p className="mutedText">{bookingRead.error}</p>
          </section>
        ) : null}
        <AdminBookingManagement bookings={bookingRead.data} />
      </div>
    </AdminShell>
  );
}
