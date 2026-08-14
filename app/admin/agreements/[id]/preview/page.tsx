import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { renderAdminGateIfUnauthenticated } from "@/app/admin/adminPageGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";
import { formatAgreementDateTime, loadAgreementAdminDetail, toAgreementPreviewSections } from "@/lib/partner-platform/agreement-admin";

type AgreementPreviewPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Agreement Preview",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AgreementPreviewPage({ params }: AgreementPreviewPageProps) {
  const gate = await renderAdminGateIfUnauthenticated();
  if (gate) return gate;

  const { id } = await params;
  const detail = await loadAgreementAdminDetail(id);
  if (!detail) notFound();

  const sections = toAgreementPreviewSections(detail.content?.sections);

  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <section className="adminContentHero">
          <div>
            <p className="eyebrow">Agreement preview</p>
            <h1>iThoddoo Maldives</h1>
            <p>{detail.version.title} · Version {detail.version.version_number}</p>
          </div>
          <div className="text-right">
            <div className="adminStatusPill">DRAFT — NOT YET IN EFFECT</div>
            <div className="mt-3 flex gap-3">
              <Link href={`/admin/agreements/${detail.version.id}`} className="inline-flex rounded-md border border-gray-300 px-4 py-2">Back</Link>
              {detail.version.status === "draft" ? <Link href={`/admin/agreements/${detail.version.id}/edit`} className="inline-flex rounded-md bg-blue-600 px-4 py-2 text-white">Edit</Link> : null}
            </div>
          </div>
        </section>

        <section className="adminPanel">
          <dl className="applicationDetailGrid">
            <div><dt>Status</dt><dd>{detail.version.status}</dd></div>
            <div><dt>Created</dt><dd>{formatAgreementDateTime(detail.version.created_at)}</dd></div>
            <div><dt>Published</dt><dd>{formatAgreementDateTime(detail.version.published_at)}</dd></div>
            <div><dt>Assignments</dt><dd>{detail.assignmentCount}</dd></div>
            <div><dt>Acceptances</dt><dd>{detail.acceptancesCount}</dd></div>
            <div><dt>Reacceptance</dt><dd>{detail.reacceptanceCount}</dd></div>
          </dl>
          <p className="mt-4 text-sm text-gray-700">{detail.content?.summary ?? detail.version.summary ?? "—"}</p>
        </section>

        <section className="adminPanel">
          <div className="space-y-6">
            {sections.map((section, index) => (
              <article key={section.key} className="rounded-lg border border-gray-200 p-5 bg-white">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">{index + 1}. {section.title}</h2>
                  {section.reviewTag ? <span className="adminStatusPill">{section.reviewTag.toUpperCase()} REVIEW</span> : null}
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{section.body || "—"}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
