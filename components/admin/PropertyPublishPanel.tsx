"use client";

import type { AdminManagedProperty } from "@/data/adminContent";

type PropertyPublishPanelProps = {
  isPublished: boolean;
  isFeatured: boolean;
  isSaving?: boolean;
  verificationStatus: AdminManagedProperty["verificationStatus"];
  slug: string;
  onSaveDraft: () => void;
  onSubmitForReview: () => void;
  onPublish: () => void;
  onToggleFeatured: () => void;
  onVerify: () => void;
  onArchive: () => void;
};

export function PropertyPublishPanel({
  isPublished,
  isFeatured,
  isSaving = false,
  verificationStatus,
  slug,
  onSaveDraft,
  onSubmitForReview,
  onPublish,
  onToggleFeatured,
  onVerify,
  onArchive
}: PropertyPublishPanelProps) {
  const previewHref = slug ? `/stay/${slug}?preview=admin` : "#";

  return (
    <section className="adminPanel adminPropertyPublishPanel">
      <div>
        <p className="eyebrow">Publishing</p>
        <h2>Demo Publish Controls</h2>
        <p>
          {isPublished ? "Published to the public Stay directory in this browser." : "Hidden from public Stay directory until published."}
        </p>
      </div>
      <div className="adminPropertyPreviewMeta">
        <span>{verificationStatus}</span>
        <span>{isPublished ? "Published" : "Not public"}</span>
        {isFeatured ? <span>Featured</span> : null}
      </div>
      <div className="adminPropertyEditorActions">
        <button disabled={isSaving} onClick={onSaveDraft} type="button">
          {isSaving ? "Saving..." : "Save as Draft"}
        </button>
        <button disabled={isSaving} onClick={onSubmitForReview} type="button">
          Save and Submit for Review
        </button>
        <button disabled={isSaving} onClick={onPublish} type="button">
          Save and Publish
        </button>
        <a className="adminPropertyActionLink" href={previewHref} target="_blank" rel="noopener noreferrer">
          Preview
        </a>
        <button disabled={isSaving} onClick={onVerify} type="button">
          Mark verified
        </button>
        <button disabled={isSaving} onClick={onToggleFeatured} type="button">
          {isFeatured ? "Remove featured" : "Mark featured"}
        </button>
        <button disabled={isSaving} onClick={onArchive} type="button">
          Archive/delete demo
        </button>
      </div>
    </section>
  );
}
