import type { Metadata } from "next";
import { AdminBusinessList } from "@/components/admin/AdminBusinessList";
import { getLiveTransfers } from "@/lib/repositories/liveReads";

export const metadata: Metadata = {
  title: "Admin Transfers",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminTransfersPage() {
  const read = await getLiveTransfers();
  return <AdminBusinessList title="Transfers" singular="transfer" error={read.error} records={read.data.map((item) => ({ id: item.id, title: item.title, slug: item.slug, summary: item.description, category: item.type, featured: item.featured }))} />;
}
