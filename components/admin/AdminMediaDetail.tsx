"use client";

import { useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import type { MediaAsset } from "@/data/adminCms";

type AdminMediaDetailProps = {
  asset: MediaAsset;
};

export function AdminMediaDetail({ asset }: AdminMediaDetailProps) {
  const [currentAsset, setCurrentAsset] = useState(asset);
  const [copiedPath, setCopiedPath] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="adminContentManager">
      <section className="adminContentHero">
        <div>
          <Badge>{currentAsset.category}</Badge>
          <h1>{currentAsset.filename}</h1>
          <p>{currentAsset.caption}</p>
        </div>
        <Link className="adminContentAddButton adminContentSecondaryButton" href="/admin/media">
          Back to media
        </Link>
      </section>

      <section className="adminMediaDetailLayout">
        <div className="adminMediaDetailPreview" style={{ backgroundImage: `url('${currentAsset.path}')` }} />
        <aside className="adminMediaDetailPanel">
          <Badge>{currentAsset.isHero ? "Hero image" : "Standard asset"}</Badge>
          <h2>Asset Metadata</h2>
          <dl className="adminMediaMetadata">
            <div>
              <dt>Public path</dt>
              <dd>{currentAsset.path}</dd>
            </div>
            <div>
              <dt>File type</dt>
              <dd>{currentAsset.fileType}</dd>
            </div>
            <div>
              <dt>Dimensions</dt>
              <dd>
                {currentAsset.width} x {currentAsset.height}
              </dd>
            </div>
            <div>
              <dt>File size</dt>
              <dd>{currentAsset.fileSize}</dd>
            </div>
            <div>
              <dt>Uploaded</dt>
              <dd>{currentAsset.uploadedDate}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{currentAsset.updatedDate}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>{currentAsset.source}</dd>
            </div>
            <div>
              <dt>Rights</dt>
              <dd>{currentAsset.rightsStatus}</dd>
            </div>
          </dl>
          <div className="adminContentActions">
            <button onClick={() => setCopiedPath(`Copied path: ${currentAsset.path}`)} type="button">
              Copy path
            </button>
            <button onClick={() => setCurrentAsset((current) => ({ ...current, isHero: !current.isHero }))} type="button">
              {currentAsset.isHero ? "Unmark hero" : "Mark as hero"}
            </button>
            <button onClick={() => setCurrentAsset((current) => ({ ...current, archived: !current.archived }))} type="button">
              {currentAsset.archived ? "Restore" : "Archive"}
            </button>
            <button onClick={() => setDeleteOpen(true)} type="button">
              Delete
            </button>
          </div>
        </aside>
      </section>

      <section className="adminPanel adminMediaDetailText">
        <div>
          <h2>Caption</h2>
          <p>{currentAsset.caption}</p>
        </div>
        <div>
          <h2>Alt text</h2>
          <p>{currentAsset.altText}</p>
        </div>
        <div>
          <h2>Tags</h2>
          <div className="adminPropertyAmenities">
            {currentAsset.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="adminPanel">
        <div className="adminSectionHeader">
          <p className="eyebrow">Usage locations</p>
          <h2>Currently Used By</h2>
        </div>
        <ul className="adminUsageList">
          {currentAsset.usedBy.map((usage) => (
            <li key={usage}>{usage}</li>
          ))}
        </ul>
      </section>

      {copiedPath ? (
        <section className="adminEmptyState" aria-live="polite">
          <strong>Demo action complete</strong>
          <p>{copiedPath}</p>
        </section>
      ) : null}

      {deleteOpen ? (
        <div className="adminDeleteDialog" role="dialog" aria-modal="true" aria-labelledby="media-detail-delete-title">
          <div>
            <h2 id="media-detail-delete-title">Delete demo media?</h2>
            <p>{currentAsset.filename} would be deleted from local state only. No file storage is connected yet.</p>
            <div className="adminContentActions">
              <button onClick={() => setDeleteOpen(false)} type="button">
                Cancel
              </button>
              <button onClick={() => setDeleteOpen(false)} type="button">
                Confirm demo delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
