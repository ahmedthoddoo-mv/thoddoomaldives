import type { Metadata } from "next";
import Link from "next/link";
import { renderAdminGateIfUnauthenticated } from "@/app/admin/adminPageGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";
import {
  formatAgreementCount,
  formatAgreementDateTime,
  loadAgreementAdminList,
} from "@/lib/partner-platform/agreement-admin";

export const metadata: Metadata = {
  title: "Agreement Administration",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminAgreementsPage() {
  const gate = await renderAdminGateIfUnauthenticated();
  if (gate) return gate;

  const agreements = await loadAgreementAdminList();

  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <section className="adminContentHero">
          <div>
            <p className="eyebrow">Partner operations</p>
            <h1>Agreement Administration</h1>
            <p>View, edit, preview, and publish agreement drafts from the canonical server-side path.</p>
          </div>
          <Link href="/admin/agreements/new" className="inline-flex rounded-md bg-blue-600 px-4 py-2 text-white">
            Create Draft
          </Link>
        </section>

        <section className="adminPanel">
          <div className="adminTableWrap overflow-x-auto">
            <table className="adminTable">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Version</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Published</th>
                  <th>Assignments</th>
                  <th>Acceptances</th>
                  <th>Reacceptance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {agreements.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="mutedText">
                      No agreement versions found.
                    </td>
                  </tr>
                ) : (
                  agreements.map((agreement) => (
                    <tr key={agreement.id}>
                      <td>
                        <strong>{agreement.title}</strong>
                        <div className="mutedText">{agreement.slug}</div>
                      </td>
                      <td>v{agreement.versionNumber}</td>
                      <td>
                        <span className="adminStatusPill">{agreement.status}</span>
                      </td>
                      <td>{formatAgreementDateTime(agreement.createdAt)}</td>
                      <td>{formatAgreementDateTime(agreement.publishedAt)}</td>
                      <td>{formatAgreementCount(agreement.assignmentCount, "assignment")}</td>
                      <td>{formatAgreementCount(agreement.acceptanceCount, "acceptance")}</td>
                      <td>{agreement.reacceptanceCount > 0 ? formatAgreementCount(agreement.reacceptanceCount, "partner") : "—"}</td>
                      <td>
                        <div className="flex flex-wrap gap-3">
                          <Link href={`/admin/agreements/${agreement.id}`}>View</Link>
                          {agreement.status === "draft" ? (
                            <>
                              <Link href={`/admin/agreements/${agreement.id}/edit`}>Edit</Link>
                              <Link href={`/admin/agreements/${agreement.id}/preview`}>Preview</Link>
                              <Link href={`/admin/agreements/${agreement.id}/publish`}>Publish</Link>
                            </>
                          ) : (
                            <Link href={`/admin/agreements/${agreement.id}/preview`}>Preview</Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="adminPanel">
          <h2>Lifecycle guide</h2>
          <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
            <li>Drafts may be edited and previewed.</li>
            <li>Publishing makes contractual content immutable.</li>
            <li>Assignment and acceptance are separate from publication.</li>
            <li>Enforcement remains off until the feature flags are enabled later.</li>
          </ul>
        </section>
      </div>
    </AdminShell>
  );
}
