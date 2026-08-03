import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminBusinessEditor } from "@/components/admin/AdminBusinessEditor";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";
import { SupabaseExperienceRepository } from "@/lib/repositories/supabase";

type EditExperiencePageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Edit Experience",
  robots: { index: false, follow: false }
};

export default async function EditExperiencePage({ params }: EditExperiencePageProps) {
  const { id } = await params;
  const record = await SupabaseExperienceRepository.findById(id);

  if (!record) {
    notFound();
  }

  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <AdminBusinessEditor kind="experience" id={id} initialValues={{ title: record.title, category: record.category, description: record.description, duration: record.duration, price: record.price, image: record.image, highlights: record.highlights, featured: record.featured, publicationStatus: record.publicationStatus ?? "draft", verificationStatus: record.verificationStatus ?? "pending" }} />
      </div>
    </AdminShell>
  );
}
