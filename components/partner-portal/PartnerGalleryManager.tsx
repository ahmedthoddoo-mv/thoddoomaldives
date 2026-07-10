"use client";

import { useState } from "react";
import { partnerGallery } from "@/data/partnerPortal";
import { getMediaForEntity } from "@/lib/platform/selectors";

export function PartnerGalleryManager() {
  const linkedImages = getMediaForEntity("partner", "partner-thoddoo-sun-sky").map((asset) => ({
    id: asset.id,
    path: asset.path,
    caption: asset.caption,
    isHero: asset.isHero
  }));
  const [images, setImages] = useState(linkedImages.length > 0 ? linkedImages : partnerGallery);
  const [notice, setNotice] = useState("Gallery demo state ready.");

  function markHero(id: string) {
    setImages((current) => current.map((image) => ({ ...image, isHero: image.id === id })));
  }

  function removeImage(id: string) {
    setImages((current) => current.filter((image) => image.id !== id));
    setNotice("Demo image removed from local state.");
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
      </section>

      <section className="partnerPortalGalleryGrid">
        {images.map((image) => (
          <article className="partnerPortalPanel partnerPortalGalleryCard" key={image.id}>
            <div style={{ backgroundImage: `url('${image.path}')` }} />
            <h2>{image.caption}</h2>
            <p>{image.path}</p>
            <div className="partnerPortalPills">{image.isHero ? <span>Hero image</span> : <span>Gallery image</span>}</div>
            <div className="partnerPortalActions">
              <button onClick={() => markHero(image.id)} type="button">
                Choose Hero
              </button>
              <button onClick={() => moveFirst(image.id)} type="button">
                Move First
              </button>
              <button onClick={() => removeImage(image.id)} type="button">
                Delete Demo
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
