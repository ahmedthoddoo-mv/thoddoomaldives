import type { MediaAsset } from "@/data/adminCms";

export function AdminMediaDirectory({ assets, error }: { assets: MediaAsset[]; error?: string }) {
  return (
    <>
      <section className="adminContentHero"><div><p className="eyebrow">Live media</p><h1>Media Library</h1><p>Stored media metadata and visibility. Uploads require the configured storage workflow.</p></div></section>
      {error ? <section className="adminPanel"><p className="mutedText">{error}</p></section> : null}
      <section className="adminCmsTable" aria-label="Media assets">
        <div className="adminCmsTableHeader" aria-hidden="true"><span>Asset</span><span>Category</span><span>Rights</span><span>Status</span><span>Path</span></div>
        {assets.map((asset) => <article className="adminCmsRow" key={asset.id}><div><strong>{asset.filename}</strong><p>{asset.altText}</p></div><span>{asset.category}</span><span>{asset.rightsStatus}</span><span>{asset.archived ? "Archived" : "Active"}</span><code>{asset.path}</code></article>)}
      </section>
      {!error && assets.length === 0 ? <section className="adminEmptyState"><strong>No media uploaded</strong><p>No live media records exist yet.</p></section> : null}
    </>
  );
}
