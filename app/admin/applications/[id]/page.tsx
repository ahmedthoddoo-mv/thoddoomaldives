import type { Metadata } from "next";
import { ApplicationDetailPanel } from "@/components/admin/ApplicationDetailPanel";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";

export const metadata: Metadata = {
  title: "Application Review",
  robots: {
    index: false,
    follow: false
  }
};

type AdminApplicationDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminApplicationDetailPage({ params }: AdminApplicationDetailPageProps) {
  const { id } = await params;

  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <ApplicationDetailPanel applicationId={id} />
      </div>
    </AdminShell>
  );
}
