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

function filterApplications(applications: PartnerApplicationRecord[], filters: PartnerApplicationFilters) {
  const normalizedSearch = filters.search.trim().toLowerCase();

  return applications
    .filter((application) => {
      if (!normalizedSearch) return true;
      return [
        application.businessName,
        application.contactPerson,
        application.email,
        application.whatsapp,
        application.businessType,
        application.status
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    })
    .filter((application) => filters.status === "all" || application.status === filters.status)
    .filter((application) => filters.businessType === "all" || application.businessType === filters.businessType)
    .filter((application) => filters.membershipTier === "all" || application.requestedMembershipTier === filters.membershipTier)
    .sort((left, right) => {
      const leftDate = new Date(left.submittedDate).getTime();
      const rightDate = new Date(right.submittedDate).getTime();
      return filters.sort === "newest" ? rightDate - leftDate : leftDate - rightDate;
    });
}

export function ApplicationReviewQueue({
  initialApplications,
  dataSource,
  readError
}: {
  initialApplications?: PartnerApplicationRecord[];
  dataSource?: "mock" | "supabase" | "supabase_error";
  readError?: string;
}) {
  const hasServerApplications = Boolean(initialApplications);
  const [applications, setApplications] = useState<PartnerApplicationRecord[]>(() =>
    initialApplications ?? PartnerApplicationRepository.findAll()
  );
  const [filters, setFilters] = useState<PartnerApplicationFilters>(defaultFilters);

  useEffect(() => {
    if (hasServerApplications) {
      setApplications(initialApplications ?? []);
      return () => undefined;
    }

    return subscribeToPartnerApplications(() => setApplications(PartnerApplicationRepository.findAll()));
  }, [hasServerApplications, initialApplications]);

  const filteredApplications = useMemo(() => filterApplications(applications, filters), [applications, filters]);
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
          {dataSource === "supabase" ? <p className="mutedText">Data source: Supabase</p> : null}
          {dataSource === "mock" ? <p className="mutedText">Data source: Mock</p> : null}
          {dataSource === "supabase_error" ? (
            <p className="bookingValidationPanel">Data source: Supabase unavailable. {readError ?? "Check migrations and service role configuration."}</p>
          ) : null}
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
