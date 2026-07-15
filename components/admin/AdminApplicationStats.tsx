"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PartnerApplicationRepository,
  subscribeToPartnerApplications
} from "@/lib/applications/partnerApplicationRepository";
import type { PartnerApplicationRecord } from "@/types/partner-application";

export function AdminApplicationStats({ initialApplications }: { initialApplications?: PartnerApplicationRecord[] }) {
  const hasServerApplications = Boolean(initialApplications);
  const [applications, setApplications] = useState<PartnerApplicationRecord[]>(() =>
    initialApplications ?? PartnerApplicationRepository.findAll()
  );

  useEffect(() => {
    if (hasServerApplications) {
      setApplications(initialApplications ?? []);
      return () => undefined;
    }

    return subscribeToPartnerApplications(() => setApplications(PartnerApplicationRepository.findAll()));
  }, [hasServerApplications, initialApplications]);

  const stats = useMemo(() => {
    const applicationsWithDocuments = applications.filter(
      (item) => item.verificationDocuments && item.verificationDocuments.length > 0
    );
    const averageCompletion =
      applicationsWithDocuments.length > 0
        ? Math.round(
            applicationsWithDocuments.reduce((total, item) => total + (item.verificationCompletion ?? 0), 0) /
              applicationsWithDocuments.length
          )
        : 0;
    const missingDocuments = applications.filter((item) => (item.verificationCompletion ?? 0) < 100).length;

    return [
      { label: "New applications", value: applications.filter((item) => item.status === "submitted").length },
      { label: "Under review", value: applications.filter((item) => item.status === "under_review").length },
      { label: "Changes requested", value: applications.filter((item) => item.status === "changes_requested").length },
      { label: "Approved", value: applications.filter((item) => item.status === "approved").length },
      { label: "Rejected", value: applications.filter((item) => item.status === "rejected").length },
      { label: "Verification complete", value: `${averageCompletion}%` },
      { label: "Missing documents", value: missingDocuments }
    ];
  }, [applications]);

  return (
    <section className="adminPanel">
      <div className="adminSectionHeader">
        <p className="eyebrow">Applications</p>
        <h2>Partner approval workflow</h2>
        <a href="/admin/applications">Open queue</a>
      </div>
      <div className="applicationStatsGrid">
        {stats.map((stat) => (
          <article key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
