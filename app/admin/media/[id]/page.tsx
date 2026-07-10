import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminMediaDetail } from "@/components/admin/AdminMediaDetail";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";
import { getMediaAssetById, mediaAssets } from "@/data/adminCms";

type AdminMediaDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Admin Media Detail",
  robots: {
    index: false,
    follow: false
  }
};

export function generateStaticParams() {
  return mediaAssets.map((asset) => ({ id: asset.id }));
}

export default async function AdminMediaDetailPage({ params }: AdminMediaDetailPageProps) {
  const { id } = await params;
  const asset = getMediaAssetById(id);

  if (!asset) {
    notFound();
  }

  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <AdminMediaDetail asset={asset} />
      </div>
    </AdminShell>
  );
}
