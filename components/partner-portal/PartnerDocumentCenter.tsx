"use client";

import { useState, useTransition } from "react";
import { savePartnerDocuments } from "@/app/partner/actions";
import type { PartnerPortalDocument } from "@/lib/partner-portal/partnerAccess";

export function PartnerDocumentCenter({ initialDocuments }: { initialDocuments: PartnerPortalDocument[] }) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function updateDocument(id: string, updates: Partial<PartnerPortalDocument>) {
    setDocuments((current) => current.map((document) => (document.id === id ? { ...document, ...updates } : document)));
  }

  function saveDocuments() {
    startTransition(async () => {
      const result = await savePartnerDocuments(documents);
      setMessage(result.message);
    });
  }

  return (
    <div className="partnerPortalStack">
      <section className="partnerPortalPanel">
        <div className="partnerPortalSectionHeader">
          <p className="eyebrow">Private documents</p>
          <h2>Document Center</h2>
          <button disabled={isPending} onClick={saveDocuments} type="button">
            {isPending ? "Saving..." : "Save Documents"}
          </button>
        </div>
        <div className="partnerPortalDocumentGrid">
          {documents.map((document) => (
            <article className="partnerPortalPanel" key={document.id}>
              <div className="partnerPortalSectionHeader">
                <p className="eyebrow">{document.required ? "Required" : "Optional"}</p>
                <h2>{document.label}</h2>
              </div>
              <div className="partnerPortalPills">
                <span>{document.status}</span>
                {document.expiryDate ? <span>Expires {document.expiryDate}</span> : <span>No expiry</span>}
              </div>
              <div className="partnerPortalFormGrid">
                <label>
                  <span>File Name</span>
                  <input value={document.fileName} onChange={(event) => updateDocument(document.id, { fileName: event.target.value, status: event.target.value ? "uploaded" : "missing" })} />
                </label>
                <label>
                  <span>Source File / Reference</span>
                  <input value={document.storagePath} onChange={(event) => updateDocument(document.id, { storagePath: event.target.value, status: event.target.value ? "uploaded" : "missing" })} />
                </label>
                <label>
                  <span>Expiry Date</span>
                  <input type="date" value={document.expiryDate} onChange={(event) => updateDocument(document.id, { expiryDate: event.target.value })} />
                </label>
                <div>
                  <span>Status</span>
                  <strong>{document.status}</strong>
                </div>
              </div>
              {document.adminNote ? <p>{document.adminNote}</p> : null}
            </article>
          ))}
        </div>
        {message ? <p className="propertySaveStatus propertySaveStatusSuccess">{message}</p> : null}
      </section>
    </div>
  );
}
