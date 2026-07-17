import type { Metadata } from "next";
import { ApplicationDetailPanel } from "@/components/admin/ApplicationDetailPanel";
import { AdminProtectedPage } from "@/components/admin/AdminProtectedPage";
import { getPartnerApplicationsForAdmin } from "@/lib/applications/partnerApplicationReads";

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
  const { id } = await params;
  const applicationRead = await getPartnerApplicationsForAdmin();
  const application = applicationRead.applications.find((item) => item.id === id);

  return (
    <AdminProtectedPage>
      <ApplicationDetailPanel
        applicationId={id}
        initialApplication={application}
        dataSource={applicationRead.source}
        readError={applicationRead.error}
      />
    </AdminProtectedPage>
  );
}
