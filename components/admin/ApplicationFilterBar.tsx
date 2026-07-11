"use client";

import {
  partnerApplicationBusinessTypes,
  partnerApplicationMembershipTiers,
  partnerApplicationStatuses
} from "@/data/partnerApplications";
import type { PartnerApplicationFilters } from "@/types/partner-application";

type ApplicationFilterBarProps = {
  filters: PartnerApplicationFilters;
  onChange: (filters: PartnerApplicationFilters) => void;
};

export function ApplicationFilterBar({ filters, onChange }: ApplicationFilterBarProps) {
  return (
    <div className="applicationFilterBar">
      <input
        aria-label="Search applications"
        placeholder="Search business, owner, email, WhatsApp..."
        value={filters.search}
        onChange={(event) => onChange({ ...filters, search: event.target.value })}
      />
      <select
        aria-label="Filter by status"
        value={filters.status}
        onChange={(event) => onChange({ ...filters, status: event.target.value as PartnerApplicationFilters["status"] })}
      >
        <option value="all">All statuses</option>
        {partnerApplicationStatuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
      <select
        aria-label="Filter by business type"
        value={filters.businessType}
        onChange={(event) =>
          onChange({ ...filters, businessType: event.target.value as PartnerApplicationFilters["businessType"] })
        }
      >
        <option value="all">All business types</option>
        {partnerApplicationBusinessTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
      <select
        aria-label="Filter by membership"
        value={filters.membershipTier}
        onChange={(event) =>
          onChange({ ...filters, membershipTier: event.target.value as PartnerApplicationFilters["membershipTier"] })
        }
      >
        <option value="all">All plans</option>
        {partnerApplicationMembershipTiers.map((tier) => (
          <option key={tier} value={tier}>
            {tier}
          </option>
        ))}
      </select>
      <select
        aria-label="Sort applications"
        value={filters.sort}
        onChange={(event) => onChange({ ...filters, sort: event.target.value as PartnerApplicationFilters["sort"] })}
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>
    </div>
  );
}
