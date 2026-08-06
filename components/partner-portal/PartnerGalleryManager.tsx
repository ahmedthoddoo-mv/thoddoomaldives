"use client";

import { useState } from "react";
import { savePartnerGallery } from "@/app/partner/actions";
import type { PartnerPortalGalleryItem } from "@/lib/partner-portal/partnerAccess";

export function PartnerGalleryManager({ initialGallery = [] }: { initialGallery?: PartnerPortalGalleryItem[] }) {
  const [images, setImages] = useState<PartnerPortalGalleryItem[]>(initialGallery);
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
        <div><p className="eyebrow">Gallery metadata</p><h2>Partner Gallery</h2><p>Edit captions, ordering, and the hero selection for existing owned media.</p></div>
        <button onClick={saveGallery} type="button">
          Save Gallery
        </button>
      </section>

      {images.length === 0 ? <section className="partnerPortalPanel"><h2>No media uploaded</h2><p>Contact an administrator to add approved storage assets.</p></section> : null}

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
