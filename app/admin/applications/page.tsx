import type { Metadata } from "next";
import { ApplicationReviewQueue } from "@/components/admin/ApplicationReviewQueue";
import { AdminProtectedPage } from "@/components/admin/AdminProtectedPage";
import { getPartnerApplicationsForAdmin } from "@/lib/applications/partnerApplicationReads";

export const metadata: Metadata = {
  title: "Admin Applications",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminApplicationsPage() {
  const applicationRead = await getPartnerApplicationsForAdmin();

  return (
    <AdminProtectedPage>
      <ApplicationReviewQueue
        initialApplications={applicationRead.applications}
        dataSource={applicationRead.source}
        readError={applicationRead.error}
      />
    </AdminProtectedPage>
  );
}
