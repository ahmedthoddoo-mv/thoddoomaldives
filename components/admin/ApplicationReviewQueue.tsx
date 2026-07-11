"use client";

import { useEffect, useMemo, useState } from "react";
import { ApplicationFilterBar } from "@/components/admin/ApplicationFilterBar";
import { ApplicationSummaryCard } from "@/components/admin/ApplicationSummaryCard";
import {
  PartnerApplicationRepository,
  subscribeToPartnerApplications
} from "@/lib/applications/partnerApplicationRepository";
import type { PartnerApplicationFilters, PartnerApplicationRecord } from "@/types/partner-application";

const defaultFilters: PartnerApplicationFilters = {
  search: "",
  status: "all",
  businessType: "all",
  membershipTier: "all",
  sort: "newest"
};

export function ApplicationReviewQueue() {
  const [applications, setApplications] = useState<PartnerApplicationRecord[]>(() =>
    PartnerApplicationRepository.findAll()
  );
  const [filters, setFilters] = useState<PartnerApplicationFilters>(defaultFilters);

  useEffect(() => subscribeToPartnerApplications(() => setApplications(PartnerApplicationRepository.findAll())), []);

  const filteredApplications = useMemo(() => PartnerApplicationRepository.filter(filters), [applications, filters]);
  const reviewCount = applications.filter((application) =>
    ["submitted", "under_review", "changes_requested"].includes(application.status)
  ).length;

  return (
    <div className="adminCrmStack">
      <section className="adminContentHero">
        <div>
          <p className="eyebrow">Review queue</p>
          <h1>Partner Applications</h1>
          <p>Review, request changes, approve partners, and draft listings without publishing them automatically.</p>
        </div>
        <div className="applicationHeroMetric">
          <span>{reviewCount}</span>
          <strong>Needs attention</strong>
        </div>
      </section>

      <section className="adminPanel">
        <div className="adminSectionHeader">
          <p className="eyebrow">Filters</p>
          <h2>Find applications</h2>
        </div>
        <ApplicationFilterBar filters={filters} onChange={setFilters} />
      </section>

      <section className="applicationQueueGrid">
        {filteredApplications.map((application) => (
          <ApplicationSummaryCard application={application} key={application.id} />
        ))}
      </section>

      {filteredApplications.length === 0 ? (
        <section className="adminPanel">
          <h2>No applications found</h2>
          <p className="mutedText">Try clearing filters or submit a new partner onboarding demo application.</p>
        </section>
      ) : null}
    </div>
  );
}
