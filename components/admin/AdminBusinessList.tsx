import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";

export type AdminBusinessListRecord = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  featured: boolean;
};

export function AdminBusinessList({
  title,
  singular,
  records,
  error
}: {
  title: string;
  singular: string;
  records: AdminBusinessListRecord[];
  error?: string;
}) {
  const route = title.toLowerCase();
  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <section className="adminContentHero">
          <div><p className="eyebrow">Live database</p><h1>{title}</h1><p>Manage records stored in Supabase.</p></div>
          <Link className="adminContentAddButton" href={`/admin/${route}/new`}>Add {singular}</Link>
        </section>
        {error ? <section className="adminPanel"><p className="mutedText">{error}</p></section> : null}
        <section className="adminCmsTable" aria-label={title}>
          <div className="adminCmsTableHeader" aria-hidden="true"><span>Business</span><span>Category</span><span>Featured</span><span>Slug</span><span>Actions</span></div>
          {records.map((record) => (
            <article className="adminCmsRow" key={record.id}>
              <div><strong>{record.title}</strong><p>{record.summary}</p></div>
              <span>{record.category}</span><span>{record.featured ? "Featured" : "Standard"}</span><span>{record.slug}</span>
              <div className="adminContentActions"><Link href={`/admin/${route}/${record.id}/edit`}>Edit</Link></div>
            </article>
          ))}
        </section>
        {!error && records.length === 0 ? <section className="adminEmptyState"><strong>No {title.toLowerCase()} found</strong><p>No live records exist yet.</p></section> : null}
      </div>
    </AdminShell>
  );
}
