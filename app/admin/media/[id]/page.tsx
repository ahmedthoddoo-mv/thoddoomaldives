import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";
import { renderAdminGateIfUnauthenticated } from "@/app/admin/adminPageGuard";
import { SupabaseMediaRepository } from "@/lib/repositories/supabase";

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

export default async function AdminMediaDetailPage({ params }: AdminMediaDetailPageProps) {
  const gate = await renderAdminGateIfUnauthenticated();
  if (gate) return gate;

  const { id } = await params;
  const asset = await SupabaseMediaRepository.findById(id);

  if (!asset) {
    notFound();
  }

  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <section className="adminContentHero"><div><p className="eyebrow">Live media record</p><h1>{asset.filename}</h1><p>{asset.caption || asset.altText}</p></div></section>
        <section className="adminPanel"><dl className="applicationDetailGrid"><div><dt>Path</dt><dd>{asset.path}</dd></div><div><dt>Category</dt><dd>{asset.category}</dd></div><div><dt>Rights</dt><dd>{asset.rightsStatus}</dd></div><div><dt>Status</dt><dd>{asset.archived ? "Archived" : "Active"}</dd></div></dl></section>
      </div>
    </AdminShell>
  );
}
