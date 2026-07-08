"use client";

import { useState } from "react";

export default function PropertyGallery({
  images,
  propertyName,
}: {
  images: string[];
  propertyName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const safeImages = images.filter(Boolean);
  const activeImage = safeImages[activeIndex] ?? safeImages[0];

  if (safeImages.length === 0) {
    return null;
  }

  function goToImage(index: number) {
    const lastIndex = safeImages.length - 1;

    if (index < 0) {
      setActiveIndex(lastIndex);
      return;
    }

    if (index > lastIndex) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex(index);
  }

  function handleTouchEnd(touchEnd: number) {
    if (touchStart === null) return;

    const distance = touchStart - touchEnd;
    if (Math.abs(distance) > 40) {
      goToImage(activeIndex + (distance > 0 ? 1 : -1));
    }

    setTouchStart(null);
  }

  return (
    <section className="bg-white pt-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
          <button
            type="button"
            onClick={() => setViewerOpen(true)}
            className="min-h-[60vh] rounded-3xl bg-slate-200 bg-cover bg-center text-left shadow-sm"
            style={{ backgroundImage: `url('${activeImage}')` }}
            aria-label={`Open ${propertyName} gallery`}
          />

          <div className="grid grid-cols-4 gap-3 lg:grid-cols-1">
            {safeImages.slice(0, 4).map((image, index) => (
              <button
                type="button"
                key={image}
                onClick={() => goToImage(index)}
                className={`min-h-24 rounded-2xl bg-slate-200 bg-cover bg-center ring-offset-2 transition ${
                  index === activeIndex ? "ring-2 ring-cyan-700" : ""
                }`}
                style={{ backgroundImage: `url('${image}')` }}
                aria-label={`View ${propertyName} photo ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {viewerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 p-4 text-white"
          onTouchStart={(event) => setTouchStart(event.touches[0].clientX)}
          onTouchEnd={(event) =>
            handleTouchEnd(event.changedTouches[0].clientX)
          }
        >
          <div className="flex items-center justify-between">
            <p className="font-semibold">{propertyName}</p>
            <button
              type="button"
              onClick={() => setViewerOpen(false)}
              className="rounded-full bg-white px-4 py-2 font-semibold text-slate-900"
            >
              Close
            </button>
          </div>

          <div
            className="mt-4 h-[78vh] rounded-3xl bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${activeImage}')` }}
            role="img"
            aria-label={`${propertyName} photo ${activeIndex + 1}`}
          />

          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => goToImage(activeIndex - 1)}
              className="rounded-full border border-white/40 px-5 py-3 font-semibold"
            >
              Previous
            </button>
            <p className="text-sm text-white/70">
              {activeIndex + 1} / {safeImages.length}
            </p>
            <button
              type="button"
              onClick={() => goToImage(activeIndex + 1)}
              className="rounded-full border border-white/40 px-5 py-3 font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
