import type { Metadata } from "next";
import Link from "next/link";
import { renderAdminGateIfUnauthenticated } from "@/app/admin/adminPageGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";
import { AGREEMENT_SECTION_DEFINITIONS } from "@/lib/partner-platform/agreement-admin";
import { createAgreementDraftAction } from "../actions";

export const metadata: Metadata = {
  title: "Create Agreement Draft",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AgreementNewPage() {
  const gate = await renderAdminGateIfUnauthenticated();
  if (gate) return gate;

  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <section className="adminContentHero">
          <div>
            <p className="eyebrow">New agreement</p>
            <h1>Create Agreement Draft</h1>
            <p>Use this only for future agreement versions and types.</p>
          </div>
          <Link href="/admin/agreements" className="inline-flex rounded-md border border-gray-300 px-4 py-2">
            Back
          </Link>
        </section>

        <form action={createAgreementDraftAction} className="space-y-6">
          <section className="adminPanel space-y-4">
            <div>
              <label className="block text-sm font-medium" htmlFor="title">Title</label>
              <input id="title" name="title" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium" htmlFor="agreement_key">Agreement key / type</label>
              <input
                id="agreement_key"
                name="agreement_key"
                defaultValue="PARTNERSHIP_AGREEMENT"
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium" htmlFor="summary">Summary</label>
              <textarea id="summary" name="summary" rows={4} required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
            </div>
          </section>

          <section className="adminPanel space-y-5">
            {AGREEMENT_SECTION_DEFINITIONS.map((section, index) => (
              <div key={section.key}>
                <label className="block text-sm font-medium" htmlFor={`section_${section.key}`}>
                  {index + 1}. {section.title}
                </label>
                <textarea
                  id={`section_${section.key}`}
                  name={`section_${section.key}`}
                  rows={5}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
                />
              </div>
            ))}
          </section>

          <section className="adminPanel flex justify-end">
            <button type="submit" className="inline-flex rounded-md bg-blue-600 px-4 py-2 text-white">
              Create Draft
            </button>
          </section>
        </form>
      </div>
    </AdminShell>
  );
}
