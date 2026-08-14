import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { renderAdminGateIfUnauthenticated } from "@/app/admin/adminPageGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";
import {
  AGREEMENT_SECTION_DEFINITIONS,
  formatAgreementDateTime,
  loadAgreementAdminDetail,
  toAgreementPreviewSections,
} from "@/lib/partner-platform/agreement-admin";
import { updateAgreementDraftAction } from "../../actions";

type AgreementEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Edit Agreement Draft",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AgreementEditPage({ params }: AgreementEditPageProps) {
  const gate = await renderAdminGateIfUnauthenticated();
  if (gate) return gate;

  const { id } = await params;
  const detail = await loadAgreementAdminDetail(id);
  if (!detail) notFound();

  const sections = toAgreementPreviewSections(detail.content?.sections);

  if (detail.version.status !== "draft") {
    return (
      <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
        <div className="adminContent">
          <section className="adminPanel">
            <h1>Draft editing is unavailable</h1>
            <p className="mutedText">Only draft agreements may be edited.</p>
            <div className="mt-4 flex gap-3">
              <Link href={`/admin/agreements/${detail.version.id}`} className="inline-flex rounded-md border border-gray-300 px-4 py-2">Back</Link>
              <Link href={`/admin/agreements/${detail.version.id}/preview`} className="inline-flex rounded-md bg-gray-800 px-4 py-2 text-white">Preview</Link>
            </div>
          </section>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <section className="adminContentHero">
          <div>
            <p className="eyebrow">Edit draft</p>
            <h1>{detail.version.title}</h1>
            <p>Version {detail.version.version_number} · created {formatAgreementDateTime(detail.version.created_at)}</p>
          </div>
          <div className="flex gap-3">
            <Link href={`/admin/agreements/${detail.version.id}`} className="inline-flex rounded-md border border-gray-300 px-4 py-2">Back</Link>
            <Link href={`/admin/agreements/${detail.version.id}/preview`} className="inline-flex rounded-md bg-gray-800 px-4 py-2 text-white">Preview</Link>
          </div>
        </section>

        <form action={updateAgreementDraftAction.bind(null, detail.version.id)} className="space-y-6">
          <section className="adminPanel space-y-4">
            <div>
              <label className="block text-sm font-medium" htmlFor="title">Title</label>
              <input id="title" name="title" defaultValue={detail.version.title} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium" htmlFor="summary">Summary</label>
              <textarea id="summary" name="summary" rows={4} defaultValue={detail.content?.summary ?? detail.version.summary ?? ""} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
            </div>
          </section>

          <section className="adminPanel">
            <div className="space-y-5">
              {AGREEMENT_SECTION_DEFINITIONS.map((section, index) => {
                const current = sections[index];
                return (
                  <div key={section.key}>
                    <label className="block text-sm font-medium" htmlFor={`section_${section.key}`}>
                      {index + 1}. {section.title}
                    </label>
                    <textarea
                      id={`section_${section.key}`}
                      name={`section_${section.key}`}
                      rows={5}
                      defaultValue={current?.body ?? ""}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
                    />
                  </div>
                );
              })}
            </div>
          </section>

          <section className="adminPanel flex justify-end gap-3">
            <Link href={`/admin/agreements/${detail.version.id}`} className="inline-flex rounded-md border border-gray-300 px-4 py-2">
              Cancel
            </Link>
            <button type="submit" className="inline-flex rounded-md bg-blue-600 px-4 py-2 text-white">
              Save Draft
            </button>
          </section>
        </form>
      </div>
    </AdminShell>
  );
}
