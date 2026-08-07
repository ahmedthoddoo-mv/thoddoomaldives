/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useCallback } from "react";
import type { BusinessMediaItem } from "@/types/business-media";

type MenuViewerProps = {
  items: BusinessMediaItem[];
  restaurantName: string;
};

function formatMenuLabel(value: string | null | undefined, fallbackIndex: number) {
  if (!value) {
    return `Page ${fallbackIndex + 1}`;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return `Page ${fallbackIndex + 1}`;
  }

  const withoutExtension = trimmed.replace(/\.(webp|png|jpe?g|gif|avif)$/i, "");
  const cleaned = withoutExtension
    .replace(/^(food land|restaurant)\s+/i, "")
    .replace(/\bmenu\b\s*(page)?\b/gi, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return `Page ${fallbackIndex + 1}`;
  }

  return cleaned.replace(/^page\s*\d+\s*[-–:]\s*/i, "").replace(/^[—-]\s*/, "").trim();
}

export default function RestaurantMenuViewer({ items, restaurantName }: MenuViewerProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const goNext = useCallback(
    () => setLightboxIndex((current) => (current !== null ? Math.min(current + 1, items.length - 1) : null)),
    [items.length]
  );
  const goPrev = useCallback(
    () => setLightboxIndex((current) => (current !== null ? Math.max(current - 1, 0) : null)),
    []
  );

  if (items.length === 0) {
    return null;
  }

  const activeItem = lightboxIndex !== null ? items[lightboxIndex] : null;
  const activeItemLabel = activeItem ? formatMenuLabel(activeItem.caption || activeItem.altText || activeItem.fileName, lightboxIndex ?? 0) : "";

  return (
    <div>
      <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-amber-700">
        All prices are excluding 8% GST
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((item, index) => {
          const label = formatMenuLabel(item.caption || item.altText || item.fileName, index);
          return (
            <button
              key={item.id}
              type="button"
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 transition hover:border-amber-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400"
              onClick={() => openLightbox(index)}
              aria-label={`Open ${label} menu page`}
            >
              <img
                src={item.url}
                alt={item.altText || `${restaurantName} menu page ${index + 1}`}
                className="aspect-[3/4] w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-left text-white">
                <p className="text-[11px] font-semibold leading-tight">
                  {label}
                </p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white">View</span>
              </div>
            </button>
          );
        })}
      </div>

      {activeItem !== null && lightboxIndex !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`Menu viewer — page ${lightboxIndex + 1} of ${items.length}`}
        >
          <button
            type="button"
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-3 text-2xl font-bold text-white hover:bg-white/20"
            onClick={closeLightbox}
            aria-label="Close menu viewer"
          >
            ×
          </button>
          <button
            type="button"
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 px-4 py-3 text-2xl text-white hover:bg-white/20 disabled:opacity-30"
            disabled={lightboxIndex === 0}
            onClick={(event) => { event.stopPropagation(); goPrev(); }}
            aria-label="Previous menu page"
          >
            ‹
          </button>
          <button
            type="button"
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 px-4 py-3 text-2xl text-white hover:bg-white/20 disabled:opacity-30"
            disabled={lightboxIndex === items.length - 1}
            onClick={(event) => { event.stopPropagation(); goNext(); }}
            aria-label="Next menu page"
          >
            ›
          </button>
          <div
            className="relative max-h-[90vh] max-w-3xl overflow-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={activeItem.url}
              alt={activeItem.altText || `${restaurantName} menu page ${lightboxIndex + 1}`}
              className="max-h-[86vh] w-auto rounded-2xl object-contain"
            />
            <div className="mt-3 text-center text-sm text-white/70">
              {activeItemLabel}
              {activeItemLabel ? ` — ` : ""}
              Page {lightboxIndex + 1} of {items.length}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
