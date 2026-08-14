import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { renderAdminGateIfUnauthenticated } from "@/app/admin/adminPageGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";
import { formatAgreementDateTime, loadAgreementAdminDetail } from "@/lib/partner-platform/agreement-admin";
import { publishAgreementDraftAction } from "../../actions";

type AgreementPublishPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Publish Agreement Draft",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AgreementPublishPage({ params }: AgreementPublishPageProps) {
  const gate = await renderAdminGateIfUnauthenticated();
  if (gate) return gate;

  const { id } = await params;
  const detail = await loadAgreementAdminDetail(id);
  if (!detail) notFound();

  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <section className="adminContentHero">
          <div>
            <p className="eyebrow">Publish confirmation</p>
            <h1>{detail.version.title}</h1>
            <p>Version {detail.version.version_number} · draft review only</p>
          </div>
          <Link href={`/admin/agreements/${detail.version.id}`} className="inline-flex rounded-md border border-gray-300 px-4 py-2">
            Back
          </Link>
        </section>

        <section className="adminPanel space-y-3">
          <dl className="applicationDetailGrid">
            <div><dt>Status</dt><dd>{detail.version.status}</dd></div>
            <div><dt>Created</dt><dd>{formatAgreementDateTime(detail.version.created_at)}</dd></div>
            <div><dt>Assignments</dt><dd>{detail.assignmentCount}</dd></div>
            <div><dt>Acceptances</dt><dd>{detail.acceptancesCount}</dd></div>
          </dl>
          <p className="text-sm text-gray-700">
            Publishing makes this version immutable. It does not assign the agreement and it does not activate enforcement.
          </p>
        </section>

        {detail.version.status !== "draft" ? (
          <section className="adminPanel">
            <p className="mutedText">Only draft versions can be published.</p>
          </section>
        ) : (
          <form action={publishAgreementDraftAction.bind(null, detail.version.id)} className="space-y-6">
            <section className="adminPanel space-y-4">
              <label className="flex items-start gap-3">
                <input type="checkbox" name="confirm_publish" className="mt-1" />
                <span>I understand I am publishing this draft agreement.</span>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" name="confirm_immutable" className="mt-1" />
                <span>I understand published contractual content cannot be edited.</span>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" name="confirm_no_auto_assign" className="mt-1" />
                <span>I understand publishing does not assign partners or activate enforcement.</span>
              </label>
            </section>

            <section className="adminPanel flex justify-end gap-3">
              <Link href={`/admin/agreements/${detail.version.id}`} className="inline-flex rounded-md border border-gray-300 px-4 py-2">
                Cancel
              </Link>
              <button type="submit" className="inline-flex rounded-md bg-purple-600 px-4 py-2 text-white">
                Publish Draft
              </button>
            </section>
          </form>
        )}
      </div>
    </AdminShell>
  );
}
