import type { Metadata } from "next";
import { AdminPropertyForm } from "@/components/admin/AdminPropertyForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";
import { PropertyRepository } from "@/lib/repositories";
import { getLiveAdminProperties } from "@/lib/repositories/liveReads";

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
  const propertyRead = await getLiveAdminProperties();
  const property =
    propertyRead.data.find((item) => item.id === id || item.slug === id) ??
    PropertyRepository.findById(id);

  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        {propertyRead.error ? (
          <section className="adminPanel">
            <p className="mutedText">{propertyRead.error}</p>
          </section>
        ) : null}
        <AdminPropertyForm mode="edit" property={property} propertyId={id} />
      </div>
    </AdminShell>
  );
}
