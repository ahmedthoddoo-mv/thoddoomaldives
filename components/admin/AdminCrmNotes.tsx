"use client";

import { useMemo, useState } from "react";
import Badge from "@/components/ui/Badge";
import { CRMRepository } from "@/lib/repositories";

export function AdminCrmNotes() {
  const crmNotes = CRMRepository.findNotes();
  const crmPartners = CRMRepository.findAll();
  const [query, setQuery] = useState("");
  const [partnerId, setPartnerId] = useState("All");

  const filteredNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return crmNotes.filter((note) => {
      const partnerMatch = partnerId === "All" || note.partnerId === partnerId;
      const searchMatch =
        normalizedQuery.length === 0 ||
        [note.partnerBusiness, note.author, note.date, note.body].join(" ").toLowerCase().includes(normalizedQuery);
      return partnerMatch && searchMatch;
    });
  }, [partnerId, query]);

  return (
    <div className="adminCrmStack">
      <section className="adminContentHero">
        <div>
          <Badge>Notes</Badge>
          <h1>Partner Notes</h1>
          <p>Internal CRM notes for owner interest, content gaps, callbacks, and follow-up context.</p>
        </div>
        <a className="adminContentAddButton" href="/admin/crm/partners">
          View Partners
        </a>
      </section>

      <section className="adminPanel adminCrmNoteFilters">
        <label className="adminSearchField" htmlFor="crm-note-search">
          <span>Search notes</span>
          <input id="crm-note-search" onChange={(event) => setQuery(event.target.value)} placeholder="Search notes..." value={query} />
        </label>
        <label className="adminSearchField" htmlFor="crm-note-partner">
          <span>Partner</span>
          <select id="crm-note-partner" onChange={(event) => setPartnerId(event.target.value)} value={partnerId}>
            <option>All</option>
            {crmPartners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.business}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="adminCrmNotesTimeline" aria-label="CRM notes">
        {filteredNotes.map((note) => (
          <article key={note.id}>
            <div>
              <strong>{note.partnerBusiness}</strong>
              <span>{note.date}</span>
            </div>
            <p>{note.body}</p>
            <small>By {note.author}</small>
          </article>
        ))}
      </section>

      {filteredNotes.length === 0 ? (
        <section className="adminEmptyState">
          <strong>No notes found</strong>
          <p>Clear search or partner filters to return to the internal notes timeline.</p>
        </section>
      ) : null}
    </div>
  );
}
