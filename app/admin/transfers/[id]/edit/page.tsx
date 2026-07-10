import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminCmsForm } from "@/components/admin/AdminCmsForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";
import { getAdminCmsRecord, getAdminCmsSection } from "@/data/adminCms";

type EditTransferPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Edit Transfer",
  robots: { index: false, follow: false }
};

export function generateStaticParams() {
  return getAdminCmsSection("transfers").records.map((record) => ({ id: record.id }));
}

export default async function EditTransferPage({ params }: EditTransferPageProps) {
  const { id } = await params;
  const section = getAdminCmsSection("transfers");
  const record = getAdminCmsRecord("transfers", id);

  if (!record) {
    notFound();
  }

  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <AdminCmsForm mode="edit" record={record} section={section} />
      </div>
    </AdminShell>
  );
}
