import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminBusinessEditor } from "@/components/admin/AdminBusinessEditor";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";
import { renderAdminGateIfUnauthenticated } from "@/app/admin/adminPageGuard";
import { SupabaseRestaurantRepository } from "@/lib/repositories/supabase";

type EditRestaurantPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Edit Restaurant",
  robots: { index: false, follow: false }
};

export default async function EditRestaurantPage({ params }: EditRestaurantPageProps) {
  const gate = await renderAdminGateIfUnauthenticated();
  if (gate) return gate;

  const { id } = await params;
  const record = await SupabaseRestaurantRepository.findById(id);

  if (!record) {
    notFound();
  }

  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <AdminBusinessEditor kind="restaurant" id={id} initialValues={{ title: record.name, cuisine: record.cuisine, description: record.description, openingHours: record.openingHours, price: record.priceRange, location: record.location, image: record.image, featured: record.featured, publicationStatus: record.publicationStatus ?? "draft", verificationStatus: record.verificationStatus ?? "pending" }} />
      </div>
    </AdminShell>
  );
}
