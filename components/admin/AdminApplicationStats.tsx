"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PartnerApplicationRepository,
  subscribeToPartnerApplications
} from "@/lib/applications/partnerApplicationRepository";
import type { PartnerApplicationRecord } from "@/types/partner-application";

export function AdminApplicationStats() {
  const [applications, setApplications] = useState<PartnerApplicationRecord[]>(() =>
    PartnerApplicationRepository.findAll()
  );

  useEffect(() => subscribeToPartnerApplications(() => setApplications(PartnerApplicationRepository.findAll())), []);

  const stats = useMemo(
    () => [
      { label: "New applications", value: applications.filter((item) => item.status === "submitted").length },
      { label: "Under review", value: applications.filter((item) => item.status === "under_review").length },
      { label: "Changes requested", value: applications.filter((item) => item.status === "changes_requested").length },
      { label: "Approved", value: applications.filter((item) => item.status === "approved").length },
      { label: "Rejected", value: applications.filter((item) => item.status === "rejected").length },
      { label: "Awaiting partner", value: applications.filter((item) => item.status === "changes_requested").length }
    ],
    [applications]
  );

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
