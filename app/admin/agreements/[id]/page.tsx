import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { renderAdminGateIfUnauthenticated } from "@/app/admin/adminPageGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";
import {
  formatAgreementCount,
  formatAgreementDateTime,
  loadAgreementAdminDetail,
  toAgreementPreviewSections,
} from "@/lib/partner-platform/agreement-admin";

type AgreementDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Agreement Detail",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AgreementDetailPage({ params }: AgreementDetailPageProps) {
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
            <p className="eyebrow">Agreement detail</p>
            <h1>{detail.version.title}</h1>
            <p>Version {detail.version.version_number} · {detail.version.status}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/agreements" className="inline-flex rounded-md border border-gray-300 px-4 py-2">Back</Link>
            {detail.version.status === "draft" ? (
              <>
                <Link href={`/admin/agreements/${detail.version.id}/edit`} className="inline-flex rounded-md bg-blue-600 px-4 py-2 text-white">Edit</Link>
                <Link href={`/admin/agreements/${detail.version.id}/preview`} className="inline-flex rounded-md bg-gray-800 px-4 py-2 text-white">Preview</Link>
                <Link href={`/admin/agreements/${detail.version.id}/publish`} className="inline-flex rounded-md bg-purple-600 px-4 py-2 text-white">Publish</Link>
              </>
            ) : (
              <Link href={`/admin/agreements/${detail.version.id}/preview`} className="inline-flex rounded-md bg-gray-800 px-4 py-2 text-white">Preview</Link>
            )}
          </div>
        </section>

        <section className="adminPanel">
          <dl className="applicationDetailGrid">
            <div><dt>Title</dt><dd>{detail.version.title}</dd></div>
            <div><dt>Agreement key</dt><dd>{detail.version.slug}</dd></div>
            <div><dt>Status</dt><dd>{detail.version.status}</dd></div>
            <div><dt>Version</dt><dd>v{detail.version.version_number}</dd></div>
            <div><dt>Created</dt><dd>{formatAgreementDateTime(detail.version.created_at)}</dd></div>
            <div><dt>Creator</dt><dd>{detail.creatorAuthUserId ?? "—"}</dd></div>
            <div><dt>Effective date</dt><dd>{formatAgreementDateTime(detail.version.effective_at)}</dd></div>
            <div><dt>Published</dt><dd>{formatAgreementDateTime(detail.version.published_at)}</dd></div>
            <div><dt>Content hash</dt><dd>{detail.content?.content_hash ?? detail.version.content_hash ?? "—"}</dd></div>
            <div><dt>Section count</dt><dd>{formatAgreementCount(sections.length, "section")}</dd></div>
            <div><dt>Assignments</dt><dd>{formatAgreementCount(detail.assignmentCount, "assignment")}</dd></div>
            <div><dt>Acceptances</dt><dd>{formatAgreementCount(detail.acceptancesCount, "acceptance")}</dd></div>
            <div><dt>Reacceptance</dt><dd>{formatAgreementCount(detail.reacceptanceCount, "partner")}</dd></div>
          </dl>
          <p className="mutedText mt-4">{detail.content?.summary ?? detail.version.summary ?? "—"}</p>
        </section>

        <section className="adminPanel">
          <h2>Agreement content</h2>
          <div className="space-y-6">
            {sections.map((section, index) => (
              <article key={section.key} className="rounded-lg border border-gray-200 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{index + 1}. {section.title}</h3>
                  {section.reviewTag ? <span className="adminStatusPill">{section.reviewTag.toUpperCase()} REVIEW</span> : null}
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{section.body || "—"}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="adminPanel">
          <h2>Audit history</h2>
          <div className="space-y-3">
            {detail.auditEvents.length === 0 ? (
              <p className="mutedText">No audit events found.</p>
            ) : (
              detail.auditEvents.map((event) => (
                <div key={`${event.eventType}-${event.occurredAt}`} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex flex-wrap gap-3 text-sm">
                    <strong>{event.eventType}</strong>
                    <span>{event.actorRole ?? "—"}</span>
                    <span>{event.actorAuthUserId ?? "—"}</span>
                    <span>{formatAgreementDateTime(event.occurredAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
