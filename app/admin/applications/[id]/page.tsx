import type { Metadata } from "next";
import { ApplicationDetailPanel } from "@/components/admin/ApplicationDetailPanel";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminSidebarItems } from "@/data/adminContent";
import { renderAdminGateIfUnauthenticated } from "@/app/admin/adminPageGuard";
import { getPartnerApplicationsForAdmin } from "@/lib/applications/partnerApplicationReads";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

type OwnerOption = {
  id: string;
  businessName: string;
  status: string;
  verificationStatus: string;
};

type ListingOption = {
  id: string;
  name: string;
  slug: string;
  publicationStatus: string;
  verificationStatus: string;
  applicationId?: string;
};

export const metadata: Metadata = {
  title: "Application Review",
  robots: {
    index: false,
    follow: false
  }
};

type AdminApplicationDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminApplicationDetailPage({ params }: AdminApplicationDetailPageProps) {
  const gate = await renderAdminGateIfUnauthenticated();
  if (gate) return gate;

  const { id } = await params;
  const applicationRead = await getPartnerApplicationsForAdmin();
  const application = applicationRead.applications.find((item) => item.id === id);
  let ownerOptions: OwnerOption[] = [];
  let listingOptions: ListingOption[] = [];

  if (applicationRead.source === "supabase" && application) {
    const db = createSupabaseServiceRoleClient();
    if (db) {
      const [partnerResult, listingResult] = await Promise.all([
        db
          .from("partners")
          .select("id, business_name, status, verification_status, application_id")
          .order("business_name", { ascending: true }),
        application.listingWorkflow === "property"
          ? db.from("properties").select("id, name, slug, publication_status, verification_status, application_id").order("name", { ascending: true })
          : application.listingWorkflow === "restaurant"
            ? db.from("restaurants").select("id, name, slug, publication_status, verification_status, application_id").order("name", { ascending: true })
            : application.listingWorkflow === "transfer"
              ? db.from("transfers").select("id, title, slug, publication_status, verification_status, application_id").order("title", { ascending: true })
              : db.from("experiences").select("id, title, slug, publication_status, verification_status, application_id").order("title", { ascending: true })
      ]);

      ownerOptions = ((partnerResult.data ?? []) as Array<{
        id: string;
        business_name: string;
        status: string;
        verification_status: string;
        application_id: string | null;
      }>)
        .filter((partner) => !partner.application_id || partner.application_id === application.id)
        .map((partner) => ({
          id: partner.id,
          businessName: partner.business_name,
          status: partner.status,
          verificationStatus: partner.verification_status
        }));

      listingOptions = ((listingResult.data ?? []) as Array<{
        id: string;
        name?: string;
        title?: string;
        slug: string;
        publication_status: string;
        verification_status: string;
        application_id: string | null;
      }>)
        .filter((listing) => !listing.application_id || listing.application_id === application.id)
        .map((listing) => ({
          id: listing.id,
          name: listing.name ?? listing.title ?? listing.slug,
          slug: listing.slug,
          publicationStatus: listing.publication_status,
          verificationStatus: listing.verification_status,
          applicationId: listing.application_id ?? undefined
        }));
    }
  }

  return (
    <AdminShell sidebar={<AdminSidebar items={adminSidebarItems} />}>
      <div className="adminContent">
        <ApplicationDetailPanel
          initialApplication={application}
          dataSource={applicationRead.source}
          readError={applicationRead.error}
          availableOwners={ownerOptions}
          availableListings={listingOptions}
        />
      </div>
    </AdminShell>
  );
}
