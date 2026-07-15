"use client";

import { useState } from "react";
import { savePartnerGallery } from "@/app/partner/actions";
import { partnerGallery } from "@/data/partnerPortal";
import { getMediaForEntity } from "@/lib/platform/selectors";
import type { PartnerPortalGalleryItem } from "@/lib/partner-portal/partnerAccess";

export function PartnerGalleryManager({ initialGallery }: { initialGallery?: PartnerPortalGalleryItem[] }) {
  const linkedImages = getMediaForEntity("partner", "partner-thoddoo-sun-sky").map((asset) => ({
    id: asset.id,
    path: asset.path,
    caption: asset.caption,
    altText: asset.altText,
    usage: asset.isHero ? "hero" : "gallery",
    sortOrder: 0
  }));
  const [images, setImages] = useState<PartnerPortalGalleryItem[]>(
    initialGallery !== undefined
      ? initialGallery
      : linkedImages.length > 0
        ? linkedImages as PartnerPortalGalleryItem[]
        : partnerGallery.map((image, index) => ({
            id: image.id,
            path: image.path,
            caption: image.caption,
            altText: image.caption,
            usage: image.isHero ? "hero" : "gallery",
            sortOrder: index
          }))
  );
  const [notice, setNotice] = useState("Gallery ready.");

  function markHero(id: string) {
    setImages((current) => current.map((image) => ({ ...image, usage: image.id === id ? "hero" : "gallery" })));
  }

  function removeImage(id: string) {
    setImages((current) => current.filter((image) => image.id !== id));
    setNotice("Image removed from the pending gallery changes.");
  }

  function moveFirst(id: string) {
    setImages((current) => {
      const selected = current.find((image) => image.id === id);
      if (!selected) {
        return current;
      }
      return [selected, ...current.filter((image) => image.id !== id)];
    });
  }

  async function saveGallery() {
    const result = await savePartnerGallery(images.map((image, index) => ({ ...image, sortOrder: index })));
    setNotice(result.message);
  }

  return (
    <div className="partnerPortalStack">
      <section className="partnerPortalPanel partnerPortalUploadPanel">
        <div>
          <p className="eyebrow">Upload placeholder</p>
          <h2>Partner Gallery Upload</h2>
          <p>Real upload storage is not connected. This panel is ready for a future media service integration.</p>
        </div>
        <button onClick={() => setNotice("Upload placeholder queued. Connect to storage later.")} type="button">
          Upload Placeholder
        </button>
        <button onClick={saveGallery} type="button">
          Save Gallery
        </button>
      </section>

      <section className="partnerPortalGalleryGrid">
        {images.map((image) => (
          <article className="partnerPortalPanel partnerPortalGalleryCard" key={image.id}>
            <div style={{ backgroundImage: `url('${image.path}')` }} />
            <h2>{image.caption}</h2>
            <p>{image.path}</p>
            <input
              value={image.caption}
              onChange={(event) => setImages((current) => current.map((item) => item.id === image.id ? { ...item, caption: event.target.value } : item))}
              aria-label="Caption"
            />
            <input
              value={image.altText}
              onChange={(event) => setImages((current) => current.map((item) => item.id === image.id ? { ...item, altText: event.target.value } : item))}
              aria-label="Alt text"
            />
            <div className="partnerPortalPills">{image.usage === "hero" ? <span>Hero image</span> : <span>{image.usage}</span>}</div>
            <div className="partnerPortalActions">
              <button onClick={() => markHero(image.id)} type="button">
                Choose Hero
              </button>
              <button onClick={() => moveFirst(image.id)} type="button">
                Move First
              </button>
              <button onClick={() => removeImage(image.id)} type="button">
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="partnerPortalNotice" aria-live="polite">
        {notice}
      </section>
    </div>
  );
}
