import type { Metadata } from "next";
import { AdminBusinessList } from "@/components/admin/AdminBusinessList";
import { getLiveExperiences } from "@/lib/repositories/liveReads";

export const metadata: Metadata = {
  title: "Admin Experiences",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminExperiencesPage() {
  const read = await getLiveExperiences();
  return <AdminBusinessList title="Experiences" singular="experience" error={read.error} records={read.data.map((item) => ({ id: item.id, title: item.title, slug: item.slug, summary: item.description, category: item.category, featured: item.featured }))} />;
}
