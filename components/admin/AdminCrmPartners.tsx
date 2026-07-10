"use client";

import { useMemo, useState } from "react";
import Badge from "@/components/ui/Badge";
import { AdminCrmStatusBadge } from "@/components/admin/AdminCrmStatusBadge";
import { crmFilterOptions, crmPartners, type CrmPartner } from "@/data/adminCrm";

type CrmFilter = (typeof crmFilterOptions)[number];

function searchablePartnerText(partner: CrmPartner) {
  return [
    partner.business,
    partner.owner,
    partner.whatsapp,
    partner.email,
    partner.website,
    partner.address,
    partner.gps,
    partner.category,
    partner.status,
    partner.leadSource,
    partner.priority,
    partner.lastContact,
    partner.nextFollowUp,
    partner.verification,
    partner.membership,
    ...partner.notes
  ]
    .join(" ")
    .toLowerCase();
}

function matchesFilter(partner: CrmPartner, filter: CrmFilter) {
  if (filter === "All") {
    return true;
  }

  if (["Guesthouse", "Restaurant", "Transfer", "Excursion", "Shop"].includes(filter)) {
    return partner.category === filter;
  }

  if (filter === "Pending") {
    return partner.status === "Pending" || partner.verification === "Pending";
  }

  if (filter === "Verified") {
    return partner.verification === "Verified" || partner.status === "Verified";
  }

  return partner.membership === filter;
}

export function AdminCrmPartners() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<CrmFilter>("All");
  const [selectedPartnerId, setSelectedPartnerId] = useState(crmPartners[0]?.id ?? "");

  const filteredPartners = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return crmPartners.filter((partner) => {
      const searchMatch = normalizedQuery.length === 0 || searchablePartnerText(partner).includes(normalizedQuery);
      return searchMatch && matchesFilter(partner, activeFilter);
    });
  }, [activeFilter, query]);

  const selectedPartner = crmPartners.find((partner) => partner.id === selectedPartnerId) ?? filteredPartners[0] ?? crmPartners[0];

  return (
    <div className="adminCrmStack">
      <section className="adminContentHero">
        <div>
          <Badge>Partner CRM</Badge>
          <h1>Partner Relationship Pipeline</h1>
          <p>Track internal partner leads, owners, follow-ups, verification, membership potential, and sales notes.</p>
        </div>
        <a className="adminContentAddButton" href="/admin/crm/tasks">
          View Tasks
        </a>
      </section>

      <section className="adminPanel">
        <div className="adminContentToolbar">
          <label className="adminSearchField" htmlFor="crm-search">
            <span>Global search</span>
            <input
              id="crm-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search business, owner, WhatsApp, email, notes, status..."
              type="search"
              value={query}
            />
          </label>
          <div className="adminFilterGroup" aria-label="CRM filters">
            {crmFilterOptions.map((filter) => (
              <button
                className={filter === activeFilter ? "adminFilterActive" : ""}
                key={filter}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {selectedPartner ? (
        <section className="adminPanel adminCrmPreview">
          <div>
            <Badge>{selectedPartner.category}</Badge>
            <h2>{selectedPartner.business}</h2>
            <p>{selectedPartner.notes[0]}</p>
          </div>
          <div className="adminCrmPreviewGrid">
            <span>Owner: {selectedPartner.owner}</span>
            <span>Next follow-up: {selectedPartner.nextFollowUp}</span>
            <span>Lead source: {selectedPartner.leadSource}</span>
            <span>GPS: {selectedPartner.gps}</span>
          </div>
        </section>
      ) : null}

      <section className="adminCrmTable" aria-label="CRM partners">
        <div className="adminCrmTableHeader" aria-hidden="true">
          <span>Partner</span>
          <span>Category</span>
          <span>Status</span>
          <span>Priority</span>
          <span>Follow-up</span>
          <span>Contact</span>
        </div>
        {filteredPartners.map((partner) => (
          <article className="adminCrmRow" key={partner.id}>
            <div>
              <strong>{partner.business}</strong>
              <p>{partner.owner}</p>
              <small>{partner.address}</small>
            </div>
            <span>{partner.category}</span>
            <div className="adminCrmBadgeStack">
              <AdminCrmStatusBadge label={partner.status} />
              <AdminCrmStatusBadge label={partner.verification} />
              <AdminCrmStatusBadge label={partner.membership} />
            </div>
            <AdminCrmStatusBadge label={partner.priority} />
            <time>{partner.nextFollowUp}</time>
            <div className="adminCrmContact">
              <span>{partner.whatsapp}</span>
              <span>{partner.email}</span>
              <button onClick={() => setSelectedPartnerId(partner.id)} type="button">
                Preview
              </button>
            </div>
          </article>
        ))}
      </section>

      {filteredPartners.length === 0 ? (
        <section className="adminEmptyState">
          <strong>No CRM partners found</strong>
          <p>Clear search or filters to return to the mock partner pipeline.</p>
        </section>
      ) : null}
    </div>
  );
}
