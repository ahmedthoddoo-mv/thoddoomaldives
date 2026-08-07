import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPropertyForm } from "@/components/admin/AdminPropertyForm";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";
import { renderAdminGateIfUnauthenticated } from "@/app/admin/adminPageGuard";
import { listManagedBusinessMedia } from "@/lib/business-media/server";
import { getLiveAdminProperties } from "@/lib/repositories/liveReads";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

type EditGuesthousePageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Edit Guesthouse",
  robots: { index: false, follow: false }
};

export default async function EditGuesthousePage({ params }: EditGuesthousePageProps) {
  const gate = await renderAdminGateIfUnauthenticated();
  if (gate) return gate;

  const { id } = await params;
  const propertyRead = await getLiveAdminProperties();
  const property = propertyRead.data.find((item) => item.id === id || item.slug === id);
  if (!property) notFound();
  const db = createSupabaseServiceRoleClient();
  const media = db ? await listManagedBusinessMedia(db, "property", property.id) : [];

  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <AdminPropertyForm mode="edit" property={property} propertyId={property.id} initialMedia={media} />
      </div>
    </AdminShell>
  );
}
