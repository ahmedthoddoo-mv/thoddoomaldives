import type { Metadata } from "next";
import { AdminBusinessList } from "@/components/admin/AdminBusinessList";
import { getLiveRestaurants } from "@/lib/repositories/liveReads";

export const metadata: Metadata = {
  title: "Admin Restaurants",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminRestaurantsPage() {
  const read = await getLiveRestaurants();
  return <AdminBusinessList title="Restaurants" singular="restaurant" error={read.error} records={read.data.map((item) => ({ id: item.id, title: item.name, slug: item.slug, summary: item.description, category: item.cuisine.join(", "), featured: item.featured }))} />;
}
