"use client";

import { useMemo, useState } from "react";
import Badge from "@/components/ui/Badge";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import type { AdminCmsRecord, AdminCmsSectionConfig, PublicationStatus } from "@/data/adminCms";

type AdminCmsListProps = {
  section: AdminCmsSectionConfig;
};

type CmsFilter = "All" | PublicationStatus | "Verified" | "Featured" | "Unfeatured";

const filters: CmsFilter[] = ["All", "Published", "Draft", "Verified", "Featured", "Unfeatured", "Archived"];

function recordSearchText(record: AdminCmsRecord) {
  return Object.values(record)
    .map((value) => (typeof value === "object" ? JSON.stringify(value) : String(value)))
    .join(" ")
    .toLowerCase();
}

function matchesFilter(record: AdminCmsRecord, filter: CmsFilter) {
  if (filter === "All") {
    return true;
  }

  if (filter === "Verified") {
    return record.verificationStatus === "Verified";
  }

  if (filter === "Featured") {
    return record.isFeatured;
  }

  if (filter === "Unfeatured") {
    return !record.isFeatured;
  }

  return record.publicationStatus === filter;
}

export function AdminCmsList({ section }: AdminCmsListProps) {
  const [records, setRecords] = useState(section.records);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<CmsFilter>("All");
  const [previewId, setPreviewId] = useState(section.records[0]?.id ?? "");
  const [deleteId, setDeleteId] = useState("");
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return records.filter((record) => {
      const searchMatch = normalizedQuery.length === 0 || recordSearchText(record).includes(normalizedQuery);
      return searchMatch && matchesFilter(record, activeFilter);
    });
  }, [activeFilter, query, records]);

  const previewRecord = records.find((record) => record.id === previewId) ?? filteredRecords[0] ?? records[0];
  const deleteRecord = records.find((record) => record.id === deleteId);

  function updateRecord(id: string, updater: (record: AdminCmsRecord) => AdminCmsRecord) {
    setRecords((current) => current.map((record) => (record.id === id ? updater(record) : record)));
  }

  function previewRecordById(id: string) {
    setIsLoadingPreview(true);
    setPreviewId(id);
    window.setTimeout(() => setIsLoadingPreview(false), 260);
  }

  function archiveRecord(id: string) {
    updateRecord(id, (record) => ({ ...record, publicationStatus: "Archived", updated: "Just now" }));
  }

  function deleteRecordById(id: string) {
    setRecords((current) => current.filter((record) => record.id !== id));
    setDeleteId("");
  }

  return (
    <div className="adminContentManager">
      <section className="adminContentHero">
        <div>
          <Badge>{section.eyebrow}</Badge>
          <h1>{section.title}</h1>
          <p>{section.description}</p>
        </div>
        <a className="adminContentAddButton" href={`/admin/${section.slug}/new`}>
          <span aria-hidden="true">+</span>
          {section.addLabel}
        </a>
      </section>

      <section className="adminPanel">
        <div className="adminContentToolbar">
          <label className="adminSearchField" htmlFor={`${section.slug}-cms-search`}>
            <span>Search</span>
            <input
              id={`${section.slug}-cms-search`}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={section.searchPlaceholder}
              type="search"
              value={query}
            />
          </label>
          <div className="adminFilterGroup" aria-label={`${section.title} filters`}>
            {filters.map((filter) => (
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

        <div className="adminCmsLoadingState" aria-live="polite">
          {isLoadingPreview ? "Loading preview..." : "Demo CMS state ready"}
        </div>
      </section>

      {previewRecord ? (
        <section className="adminPanel adminPropertyPreviewPanel" aria-label={`${section.title} preview`}>
          <div>
            <Badge>Preview</Badge>
            <h2>{previewRecord.title}</h2>
            <p>{previewRecord.summary}</p>
          </div>
          <article className="adminPropertyPreviewCard">
            <div style={{ backgroundImage: `url('${previewRecord.heroImage}')` }} aria-label={`${previewRecord.title} preview image`} />
            <div>
              <AdminStatusBadge status={previewRecord.publicationStatus} />
              <h3>{previewRecord.title}</h3>
              <p>{previewRecord.seoDescription}</p>
              <small>
                /{section.slug}/{previewRecord.slug} · {previewRecord.category} · {previewRecord.updated}
              </small>
            </div>
          </article>
        </section>
      ) : null}

      <section className="adminCmsTable" aria-label={`${section.title} records`}>
        <div className="adminCmsTableHeader" aria-hidden="true">
          <span>Content</span>
          <span>Status</span>
          <span>Verification</span>
          <span>Featured</span>
          <span>Updated</span>
          <span>Actions</span>
        </div>

        {filteredRecords.map((record) => (
          <article className="adminCmsRow" key={record.id}>
            <div>
              <strong>{record.title}</strong>
              <p>{record.summary}</p>
              <small>{record.category}</small>
            </div>
            <AdminStatusBadge status={record.publicationStatus} />
            <AdminStatusBadge status={record.verificationStatus} />
            <AdminStatusBadge status={record.isFeatured ? "Featured" : "Standard"} />
            <time>{record.updated}</time>
            <div className="adminContentActions">
              <a href={`/admin/${section.slug}/${record.id}/edit`}>Edit</a>
              <button onClick={() => previewRecordById(record.id)} type="button">
                Preview
              </button>
              <button
                onClick={() =>
                  updateRecord(record.id, (current) => ({
                    ...current,
                    publicationStatus: current.publicationStatus === "Published" ? "Draft" : "Published",
                    updated: "Just now"
                  }))
                }
                type="button"
              >
                {record.publicationStatus === "Published" ? "Unpublish" : "Publish"}
              </button>
              <button
                onClick={() => updateRecord(record.id, (current) => ({ ...current, verificationStatus: "Verified", updated: "Just now" }))}
                type="button"
              >
                Verify
              </button>
              <button onClick={() => updateRecord(record.id, (current) => ({ ...current, isFeatured: !current.isFeatured }))} type="button">
                {record.isFeatured ? "Unfeature" : "Feature"}
              </button>
              <button onClick={() => archiveRecord(record.id)} type="button">
                Archive
              </button>
              <button onClick={() => setDeleteId(record.id)} type="button">
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>

      {filteredRecords.length === 0 ? (
        <section className="adminEmptyState">
          <strong>{section.emptyTitle}</strong>
          <p>{section.emptyDescription}</p>
        </section>
      ) : null}

      {deleteRecord ? (
        <div className="adminDeleteDialog" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
          <div>
            <h2 id="delete-dialog-title">Delete demo item?</h2>
            <p>{deleteRecord.title} will be removed from local state only. No backend data exists yet.</p>
            <div className="adminContentActions">
              <button onClick={() => setDeleteId("")} type="button">
                Cancel
              </button>
              <button onClick={() => deleteRecordById(deleteRecord.id)} type="button">
                Delete demo item
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
