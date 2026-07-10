"use client";

import { useMemo, useState } from "react";
import Badge from "@/components/ui/Badge";
import type { MediaAsset } from "@/data/adminCms";

type AdminMediaLibraryProps = {
  assets: MediaAsset[];
};

type SortOption = "Newest" | "Oldest" | "Filename" | "Usage count";

const mediaCategories: Array<"All" | MediaAsset["category"]> = [
  "All",
  "Hero",
  "Guesthouses",
  "Rooms",
  "Restaurants",
  "Food",
  "Experiences",
  "Transfers",
  "Beaches",
  "Drone",
  "Farms",
  "Gallery",
  "Logos",
  "Staff",
  "Videos",
  "Other"
];

const sortOptions: SortOption[] = ["Newest", "Oldest", "Filename", "Usage count"];

function assetSearchText(asset: MediaAsset) {
  return [asset.filename, asset.path, asset.category, asset.caption, asset.altText, asset.source, ...asset.tags, ...asset.usedBy]
    .join(" ")
    .toLowerCase();
}

function sortAssets(assets: MediaAsset[], sortBy: SortOption) {
  return [...assets].sort((left, right) => {
    if (sortBy === "Filename") {
      return left.filename.localeCompare(right.filename);
    }

    if (sortBy === "Usage count") {
      return right.usageCount - left.usageCount;
    }

    const leftTime = new Date(left.uploadedDate).getTime();
    const rightTime = new Date(right.uploadedDate).getTime();
    return sortBy === "Newest" ? rightTime - leftTime : leftTime - rightTime;
  });
}

function AdminTagEditor({
  asset,
  onAddTag,
  onRemoveTag
}: {
  asset: MediaAsset;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}) {
  const [tag, setTag] = useState("");

  return (
    <div className="adminTagEditor">
      <div className="adminPropertyAmenities">
        {asset.tags.map((item) => (
          <button key={item} onClick={() => onRemoveTag(item)} type="button">
            {item} x
          </button>
        ))}
      </div>
      <label>
        <span>Add tag</span>
        <div>
          <input onChange={(event) => setTag(event.target.value)} placeholder="e.g. homepage" value={tag} />
          <button
            onClick={() => {
              onAddTag(tag);
              setTag("");
            }}
            type="button"
          >
            Add
          </button>
        </div>
      </label>
    </div>
  );
}

function AdminUsageList({ usedBy }: { usedBy: string[] }) {
  return (
    <ul className="adminUsageList">
      {usedBy.map((usage) => (
        <li key={usage}>{usage}</li>
      ))}
    </ul>
  );
}

export function AdminMediaLibrary({ assets }: AdminMediaLibraryProps) {
  const [items, setItems] = useState(assets);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof mediaCategories)[number]>("All");
  const [tagFilter, setTagFilter] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("Newest");
  const [previewId, setPreviewId] = useState(assets[0]?.id ?? "");
  const [modalId, setModalId] = useState("");
  const [copiedPath, setCopiedPath] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [multiSelect, setMultiSelect] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const tagOptions = useMemo(() => ["All", ...Array.from(new Set(items.flatMap((asset) => asset.tags))).sort()], [items]);

  const filteredAssets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = items.filter((asset) => {
      const matchesCategory = category === "All" || asset.category === category;
      const matchesTag = tagFilter === "All" || asset.tags.includes(tagFilter);
      const matchesSearch = normalizedQuery.length === 0 || assetSearchText(asset).includes(normalizedQuery);
      return matchesCategory && matchesTag && matchesSearch;
    });

    return sortAssets(filtered, sortBy);
  }, [category, items, query, sortBy, tagFilter]);

  const previewAsset = items.find((asset) => asset.id === previewId) ?? filteredAssets[0] ?? items[0];
  const modalAsset = items.find((asset) => asset.id === modalId);
  const deleteAsset = items.find((asset) => asset.id === deleteId);

  function updateAsset(id: string, updater: (asset: MediaAsset) => MediaAsset) {
    setItems((current) => current.map((asset) => (asset.id === id ? updater(asset) : asset)));
  }

  function copyPath(path: string) {
    setCopiedPath(`Copied path: ${path}`);
  }

  function deleteAssetById(id: string) {
    setItems((current) => current.filter((asset) => asset.id !== id));
    setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
    setDeleteId("");
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]));
  }

  function runDemoUpload() {
    setUploadProgress(12);
    window.setTimeout(() => setUploadProgress(48), 220);
    window.setTimeout(() => setUploadProgress(100), 520);
    window.setTimeout(() => setCopiedPath("Upload demo complete. Connect this panel to storage later."), 720);
  }

  function addTag(assetId: string, tag: string) {
    const normalizedTag = tag.trim().toLowerCase();
    if (!normalizedTag) {
      return;
    }

    updateAsset(assetId, (asset) => ({
      ...asset,
      tags: asset.tags.includes(normalizedTag) ? asset.tags : [...asset.tags, normalizedTag],
      updatedDate: "Jul 10, 2026"
    }));
  }

  function removeTag(assetId: string, tag: string) {
    updateAsset(assetId, (asset) => ({
      ...asset,
      tags: asset.tags.filter((item) => item !== tag),
      updatedDate: "Jul 10, 2026"
    }));
  }

  return (
    <div className="adminContentManager">
      <section className="adminContentHero">
        <div>
          <Badge>Media library</Badge>
          <h1>Admin Media Library</h1>
          <p>
            Organize reusable image assets with search, category and tag filters, sorting, multi-select, captions, alt
            text, usage tracking, and storage-ready metadata. Real uploads are intentionally demo-only.
          </p>
        </div>
        <a className="adminContentAddButton" href="#upload-panel">
          <span aria-hidden="true">+</span>
          Upload placeholder
        </a>
      </section>

      <section className="adminPanel adminMediaUploadPanel" id="upload-panel">
        <div>
          <Badge>Upload UI placeholder</Badge>
          <h2>Stage New Assets</h2>
          <p>Drag files here later, assign metadata now, and connect the queue to Cloudflare R2 or Supabase Storage.</p>
        </div>
        <div className="adminUploadDropzone">
          <strong>Drop images here</strong>
          <span>Real file storage is not connected yet.</span>
          <button onClick={runDemoUpload} type="button">
            Browse files
          </button>
        </div>
        <div className="adminMediaUploadGrid">
          <label>
            <span>Category</span>
            <select defaultValue="Guesthouses">
              {mediaCategories
                .filter((item) => item !== "All")
                .map((item) => (
                  <option key={item}>{item}</option>
                ))}
            </select>
          </label>
          <label>
            <span>Tags</span>
            <input placeholder="guesthouse, homepage, hero" />
          </label>
          <label>
            <span>Photographer/source</span>
            <input placeholder="iThoddoo content team" />
          </label>
          <label>
            <span>Alt text reminder</span>
            <input placeholder="Describe the image clearly" />
          </label>
        </div>
        <label className="adminCmsBoolean">
          <input type="checkbox" />
          <span>I confirm permission or rights are documented before production upload.</span>
        </label>
        <div className="adminUploadProgress" aria-label="Upload progress">
          <span style={{ width: `${uploadProgress}%` }} />
        </div>
      </section>

      <section className="adminPanel">
        <div className="adminContentToolbar">
          <label className="adminSearchField" htmlFor="media-search">
            <span>Search</span>
            <input
              id="media-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search filename, path, caption, alt text, usage..."
              type="search"
              value={query}
            />
          </label>
          <div className="adminMediaToolbarGrid">
            <label>
              <span>Category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value as typeof category)}>
                {mediaCategories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Tag</span>
              <select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)}>
                {tagOptions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Sort</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)}>
                {sortOptions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <button className={multiSelect ? "adminFilterActive" : ""} onClick={() => setMultiSelect((current) => !current)} type="button">
              Multi-select {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
            </button>
          </div>
        </div>
      </section>

      {previewAsset ? (
        <section className="adminPanel adminMediaPreview">
          <div className="adminMediaPreviewImage" style={{ backgroundImage: `url('${previewAsset.path}')` }} />
          <div>
            <Badge>{previewAsset.category}</Badge>
            <h2>{previewAsset.filename}</h2>
            <p>{previewAsset.caption}</p>
            <small>
              {previewAsset.width} x {previewAsset.height} | {previewAsset.fileSize} | {previewAsset.rightsStatus}
            </small>
            <AdminUsageList usedBy={previewAsset.usedBy} />
            <div className="adminContentActions">
              <a href={`/admin/media/${previewAsset.id}`}>Open detail</a>
              <button onClick={() => copyPath(previewAsset.path)} type="button">
                Copy path
              </button>
              <button onClick={() => setModalId(previewAsset.id)} type="button">
                Preview modal
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="adminMediaGrid" aria-label="Media assets">
        {filteredAssets.map((asset) => (
          <article className={`adminMediaCard ${asset.archived ? "adminPropertyArchived" : ""}`} key={asset.id}>
            {multiSelect ? (
              <label className="adminMediaSelect">
                <input checked={selectedIds.includes(asset.id)} onChange={() => toggleSelected(asset.id)} type="checkbox" />
                <span>Select</span>
              </label>
            ) : null}
            <button className="adminMediaThumbButton" onClick={() => setPreviewId(asset.id)} type="button">
              <span className="adminMediaThumb" style={{ backgroundImage: `url('${asset.path}')` }} />
            </button>
            <div>
              <strong>{asset.filename}</strong>
              <p>{asset.path}</p>
              <div className="adminPropertyPreviewMeta">
                <span>{asset.category}</span>
                <span>{asset.usageCount} uses</span>
                {asset.isHero ? <span>Hero</span> : null}
              </div>
              <label className="adminMediaInlineField">
                <span>Caption</span>
                <input value={asset.caption} onChange={(event) => updateAsset(asset.id, (current) => ({ ...current, caption: event.target.value }))} />
              </label>
              <label className="adminMediaInlineField">
                <span>Alt text</span>
                <input value={asset.altText} onChange={(event) => updateAsset(asset.id, (current) => ({ ...current, altText: event.target.value }))} />
              </label>
              <AdminTagEditor asset={asset} onAddTag={(tag) => addTag(asset.id, tag)} onRemoveTag={(tag) => removeTag(asset.id, tag)} />
              <div className="adminContentActions">
                <a href={`/admin/media/${asset.id}`}>Detail</a>
                <button onClick={() => setModalId(asset.id)} type="button">
                  Modal
                </button>
                <button onClick={() => copyPath(asset.path)} type="button">
                  Copy path
                </button>
                <button onClick={() => updateAsset(asset.id, (current) => ({ ...current, isHero: !current.isHero }))} type="button">
                  {asset.isHero ? "Unmark hero" : "Mark hero"}
                </button>
                <button onClick={() => updateAsset(asset.id, (current) => ({ ...current, archived: !current.archived }))} type="button">
                  {asset.archived ? "Restore" : "Archive"}
                </button>
                <button onClick={() => setDeleteId(asset.id)} type="button">
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {copiedPath ? (
        <section className="adminEmptyState" aria-live="polite">
          <strong>Demo action complete</strong>
          <p>{copiedPath}</p>
        </section>
      ) : null}

      {filteredAssets.length === 0 ? (
        <section className="adminEmptyState">
          <strong>No media found</strong>
          <p>Clear search, category, or tag filters to return to the demo media inventory.</p>
        </section>
      ) : null}

      {modalAsset ? (
        <div className="adminMediaModal" role="dialog" aria-modal="true" aria-labelledby="media-modal-title">
          <div>
            <button aria-label="Close preview" onClick={() => setModalId("")} type="button">
              Close
            </button>
            <div className="adminMediaModalImage" style={{ backgroundImage: `url('${modalAsset.path}')` }} />
            <h2 id="media-modal-title">{modalAsset.filename}</h2>
            <p>{modalAsset.altText}</p>
          </div>
        </div>
      ) : null}

      {deleteAsset ? (
        <div className="adminDeleteDialog" role="dialog" aria-modal="true" aria-labelledby="media-delete-title">
          <div>
            <h2 id="media-delete-title">Delete demo media?</h2>
            <p>{deleteAsset.filename} will be removed from local state only.</p>
            <div className="adminContentActions">
              <button onClick={() => setDeleteId("")} type="button">
                Cancel
              </button>
              <button onClick={() => deleteAssetById(deleteAsset.id)} type="button">
                Delete demo asset
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
