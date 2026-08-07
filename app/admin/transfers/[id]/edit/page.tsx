import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminBusinessEditor } from "@/components/admin/AdminBusinessEditor";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";
import { renderAdminGateIfUnauthenticated } from "@/app/admin/adminPageGuard";
import { listManagedBusinessMedia } from "@/lib/business-media/server";
import { SupabaseTransferRepository } from "@/lib/repositories/supabase";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { AdminTransferScheduleEditor } from "@/components/admin/AdminTransferScheduleEditor";

type EditTransferPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Edit Transfer",
  robots: { index: false, follow: false }
};

export default async function EditTransferPage({ params }: EditTransferPageProps) {
  const gate = await renderAdminGateIfUnauthenticated();
  if (gate) return gate;

  const { id } = await params;
  const record = await SupabaseTransferRepository.findById(id);
  const db = createSupabaseServiceRoleClient();

  if (!record || !db) {
    notFound();
  }

  const media = await listManagedBusinessMedia(db, "transfer", id);

  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <AdminBusinessEditor
          kind="transfer"
          id={id}
          initialMedia={media}
          initialValues={{ title: record.title, transferType: record.type, description: record.description, duration: record.duration, price: record.price, departurePoint: record.departurePoint, arrivalPoint: record.arrivalPoint, schedule: record.scheduleNote, image: record.image, featured: record.featured, publicationStatus: record.publicationStatus ?? "draft", verificationStatus: record.verificationStatus ?? "pending" }}
        />
        <AdminTransferScheduleEditor transferId={id} initialSchedules={await SupabaseTransferRepository.findAllSchedules(id)} />
      </div>
    </AdminShell>
  );
}
