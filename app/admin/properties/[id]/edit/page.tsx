import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPropertyForm } from "@/components/admin/AdminPropertyForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";
import { PropertyRepository } from "@/lib/repositories";

type EditAdminPropertyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Edit Admin Property",
  robots: {
    index: false,
    follow: false
  }
};

export function generateStaticParams() {
  const adminManagedProperties = PropertyRepository.findAll();

  return adminManagedProperties.map((property) => ({
    id: property.id
  }));
}

export default async function EditAdminPropertyPage({ params }: EditAdminPropertyPageProps) {
  const { id } = await params;
  const property = PropertyRepository.findById(id);

  if (!property) {
    notFound();
  }

  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <AdminPropertyForm mode="edit" property={property} />
      </div>
    </AdminShell>
  );
}
