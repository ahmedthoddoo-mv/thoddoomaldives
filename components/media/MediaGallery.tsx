"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteBusinessMediaItem, saveBusinessMediaMetadata } from "@/app/business-media/actions";
import {
  moveEditableBusinessMediaItem,
  normalizeEditableBusinessMediaItems
} from "@/lib/business-media/collection";
import type { BusinessMediaItem, BusinessMediaType } from "@/types/business-media";

type MediaGalleryProps =
  | {
      mode: "public";
      items: BusinessMediaItem[];
      businessName: string;
      title?: string;
      description?: string;
      emptyTitle?: string;
      emptyDescription?: string;
      onItemsChange?: never;
      businessType?: never;
      businessId?: never;
    }
  | {
      mode: "manage";
      items: BusinessMediaItem[];
      businessName: string;
      businessType: BusinessMediaType;
      businessId?: string;
      title?: string;
      description?: string;
      emptyTitle?: string;
      emptyDescription?: string;
      onItemsChange?: (items: BusinessMediaItem[]) => void;
    };

type UploadProgress = {
  id: string;
  name: string;
  progress: number;
  status: "preparing" | "uploading" | "done" | "error";
  message?: string;
};

function areItemsEqual(left: BusinessMediaItem[], right: BusinessMediaItem[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((item, index) => {
    const other = right[index];
    if (!other) {
      return false;
    }

    return item.id === other.id
      && item.url === other.url
      && item.caption === other.caption
      && item.altText === other.altText
      && item.sortOrder === other.sortOrder
      && item.isCover === other.isCover
      && item.isFeatured === other.isFeatured
      && item.isPublic === other.isPublic
      && item.mediaPurpose === other.mediaPurpose;
  });
}

function getItemsSignature(items: BusinessMediaItem[]) {
  return JSON.stringify(items.map((item) => ({
    id: item.id,
    url: item.url,
    caption: item.caption,
    altText: item.altText,
    sortOrder: item.sortOrder,
    isCover: item.isCover,
    isFeatured: item.isFeatured,
    isPublic: item.isPublic,
    mediaPurpose: item.mediaPurpose
  })));
}

function sanitizeText(value: string, maxLength = 240) {
  return value.replace(/[<>]/g, "").slice(0, maxLength);
}

function toReadableSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function replaceExtension(name: string) {
  return `${name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "-") || "business-media"}.webp`;
}

async function optimizeImage(file: File) {
  const previewUrl = URL.createObjectURL(file);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    element.src = previewUrl;
  });

  const maxDimension = 2200;
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    URL.revokeObjectURL(previewUrl);
    throw new Error("This browser could not optimize the selected image.");
  }

  context.drawImage(image, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.84));
  URL.revokeObjectURL(previewUrl);

  if (!blob) {
    throw new Error(`Could not convert ${file.name} to WebP.`);
  }

  return {
    file: new File([blob], replaceExtension(file.name), { type: "image/webp" }),
    width,
    height
  };
}

export default function MediaGallery(props: MediaGalleryProps) {
  const router = useRouter();
  const manageCallback = props.mode === "manage" ? props.onItemsChange : undefined;
  const [galleryItems, setGalleryItems] = useState<BusinessMediaItem[]>(props.items);
  const [activeId, setActiveId] = useState<string>(props.items[0]?.id ?? "");
  const [notice, setNotice] = useState("");
  const [isSaving, startSaving] = useTransition();
  const [uploading, startUploading] = useTransition();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [dirty, setDirty] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const gallerySignature = useMemo(() => getItemsSignature(galleryItems), [galleryItems]);
  const propSignature = useMemo(() => getItemsSignature(props.items), [props.items]);
  const galleryItemsRef = useRef(galleryItems);
  const gallerySignatureRef = useRef(gallerySignature);

  galleryItemsRef.current = galleryItems;
  gallerySignatureRef.current = gallerySignature;

  useEffect(() => {
    if (
      gallerySignatureRef.current === propSignature
      || areItemsEqual(galleryItemsRef.current, props.items)
    ) {
      return;
    }
    setGalleryItems(props.items);
    setActiveId(props.items[0]?.id ?? "");
    setDirty(false);
  }, [propSignature, props.items]);

  useEffect(() => {
    manageCallback?.(galleryItems);
  }, [galleryItems, manageCallback]);

  useEffect(() => {
    if (galleryItems.length === 0) {
      setActiveId("");
      return;
    }
    if (!galleryItems.some((item) => item.id === activeId)) {
      setActiveId(galleryItems[0].id);
    }
  }, [activeId, galleryItems]);

  const activeItem = useMemo(
    () => galleryItems.find((item) => item.id === activeId) ?? galleryItems[0] ?? null,
    [activeId, galleryItems]
  );

  function updateItems(nextItems: BusinessMediaItem[], markDirty = true) {
    setGalleryItems(nextItems);
    if (markDirty) {
      setDirty(true);
    }
  }

  function updateItem(id: string, updater: (item: BusinessMediaItem) => BusinessMediaItem) {
    updateItems(galleryItems.map((item) => (item.id === id ? updater(item) : item)));
  }

  function setCover(id: string) {
    updateItems(
      normalizeEditableBusinessMediaItems(
        galleryItems.map((item) => ({ ...item, isCover: item.id === id }))
      )
    );
  }

  function setFeatured(id: string) {
    updateItems(
      normalizeEditableBusinessMediaItems(
        galleryItems.map((item) => ({ ...item, isFeatured: item.id === id }))
      )
    );
  }

  function togglePublic(id: string) {
    updateItem(id, (item) => ({ ...item, isPublic: !item.isPublic }));
  }

  async function uploadPreparedFile(file: File, width: number, height: number) {
    if (props.mode !== "manage" || !props.businessId) {
      throw new Error("Save this business first, then upload media.");
    }

    const progressId = `${file.name}-${Date.now()}`;
    setUploadProgress((current) => [...current, { id: progressId, name: file.name, progress: 0, status: "uploading" }]);

    const formData = new FormData();
    formData.set("businessType", props.businessType);
    formData.set("businessId", props.businessId);
    formData.set("file", file);
    formData.set("width", String(width));
    formData.set("height", String(height));
    formData.set("altText", props.businessName);

    const item = await new Promise<BusinessMediaItem>((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open("POST", "/api/business-media/upload");
      request.upload.onprogress = (event) => {
        if (!event.lengthComputable) {
          return;
        }
        setUploadProgress((current) =>
          current.map((entry) =>
            entry.id === progressId ? { ...entry, progress: Math.round((event.loaded / event.total) * 100) } : entry
          )
        );
      };
      request.onload = () => {
        const payload = JSON.parse(request.responseText || "{}") as { item?: BusinessMediaItem; message?: string };
        if (request.status >= 200 && request.status < 300 && payload.item) {
          resolve(payload.item);
          return;
        }
        reject(new Error(payload.message ?? `Upload failed for ${file.name}.`));
      };
      request.onerror = () => reject(new Error(`Upload failed for ${file.name}.`));
      request.send(formData);
    });

    setUploadProgress((current) =>
      current.map((entry) =>
        entry.id === progressId ? { ...entry, progress: 100, status: "done", message: "Uploaded" } : entry
      )
    );
    return item;
  }

  function handleFiles(files: FileList | File[]) {
    if (props.mode !== "manage") {
      return;
    }

    const selectedFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (!selectedFiles.length) {
      setNotice("Choose one or more image files to upload.");
      return;
    }

    startUploading(async () => {
      for (const selectedFile of selectedFiles) {
        const progressId = `${selectedFile.name}-${selectedFile.size}`;
        setUploadProgress((current) => [
          ...current,
          {
            id: progressId,
            name: `${selectedFile.name} (${toReadableSize(selectedFile.size)})`,
            progress: 0,
            status: "preparing"
          }
        ]);

        try {
          const optimized = await optimizeImage(selectedFile);
          setUploadProgress((current) =>
            current.filter((entry) => entry.id !== progressId)
          );
          const uploadedItem = await uploadPreparedFile(optimized.file, optimized.width, optimized.height);
          setGalleryItems((current) => normalizeEditableBusinessMediaItems([...current, uploadedItem]));
          setDirty(false);
          setNotice(`${selectedFile.name} uploaded.`);
          router.refresh();
        } catch (error) {
          setUploadProgress((current) =>
            current.map((entry) =>
              entry.id === progressId
                ? {
                    ...entry,
                    status: "error",
                    message: error instanceof Error ? error.message : "Upload failed."
                  }
                : entry
            )
          );
          setNotice(error instanceof Error ? error.message : "Upload failed.");
        }
      }
    });
  }

  function handleSave() {
    if (props.mode !== "manage" || !props.businessId) {
      setNotice("Save this business first, then manage media.");
      return;
    }
    const businessId = props.businessId;

    startSaving(async () => {
      const result = await saveBusinessMediaMetadata({
        businessType: props.businessType,
        businessId,
        items: galleryItems.map((item, index) => ({
          id: item.id,
          caption: sanitizeText(item.caption),
          altText: sanitizeText(item.altText),
          sortOrder: index,
          isCover: item.isCover,
          isFeatured: item.isFeatured,
          isPublic: item.isPublic,
          mediaPurpose: item.mediaPurpose
        }))
      });
      setNotice(result.message);
      if (result.ok) {
        setDirty(false);
        router.refresh();
      }
    });
  }

  function handleDelete(id: string) {
    if (props.mode !== "manage" || !props.businessId) {
      return;
    }
    const businessId = props.businessId;

    startSaving(async () => {
      const result = await deleteBusinessMediaItem({
        businessType: props.businessType,
        businessId,
        mediaId: id
      });
      setNotice(result.message);
      if (result.ok) {
        const remaining = galleryItems.filter((item) => item.id !== id);
        updateItems(normalizeEditableBusinessMediaItems(remaining), false);
        router.refresh();
      }
    });
  }

  const emptyTitle = props.emptyTitle ?? "No media yet";
  const emptyDescription = props.emptyDescription
    ?? (props.mode === "manage"
      ? "Upload WebP images to build a reusable public gallery for this business."
      : "No gallery images are available for this business yet.");

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">Media gallery</p>
          <h2 className="text-2xl font-semibold text-slate-950">{props.title ?? `${props.businessName} media`}</h2>
          <p className="text-sm text-slate-600">
            {props.description
              ?? (props.mode === "manage"
                ? "Upload, order, caption, and publish the photos shown across admin, partner, and public views."
                : "Browse the current photo gallery for this business.")}
          </p>
        </div>
        {props.mode === "manage" ? (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-cyan-700 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !props.businessId}
            >
              {uploading ? "Uploading…" : props.businessId ? "Upload images" : "Save business first"}
            </button>
            <button
              type="button"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleSave}
              disabled={isSaving || !dirty || !props.businessId}
            >
              {isSaving ? "Saving…" : dirty ? "Save gallery changes" : "Gallery saved"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                if (event.target.files) {
                  handleFiles(event.target.files);
                }
                event.target.value = "";
              }}
            />
          </div>
        ) : null}
      </div>

      {props.mode === "manage" ? (
        <div
          className={`mt-6 rounded-[1.75rem] border border-dashed px-5 py-6 text-sm ${
            props.businessId ? "border-cyan-200 bg-cyan-50/50 text-slate-700" : "border-slate-200 bg-slate-50 text-slate-500"
          }`}
          onDragOver={(event) => {
            if (!props.businessId) {
              return;
            }
            event.preventDefault();
          }}
          onDrop={(event) => {
            if (!props.businessId) {
              return;
            }
            event.preventDefault();
            handleFiles(event.dataTransfer.files);
          }}
        >
          <strong className="block text-slate-900">Drag and drop images here</strong>
          <span className="mt-1 block">
            Images are resized, optimized, and converted to WebP automatically before upload.
          </span>
          {!props.businessId ? <span className="mt-2 block">Create the business record before uploading media.</span> : null}
        </div>
      ) : null}

      {uploadProgress.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {uploadProgress.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-900">{entry.name}</span>
                <span className="text-slate-500">{entry.message ?? `${entry.progress}%`}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-200">
                <div
                  className={`h-2 rounded-full ${entry.status === "error" ? "bg-rose-500" : "bg-cyan-600"}`}
                  style={{ width: `${entry.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {galleryItems.length === 0 ? (
        <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <h3 className="text-lg font-semibold text-slate-950">{emptyTitle}</h3>
          <p className="mt-2 text-sm text-slate-600">{emptyDescription}</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.85fr)]">
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-100">
            {activeItem ? (
              <div className="relative min-h-[320px] bg-slate-200 sm:min-h-[460px]">
                <img src={activeItem.url} alt={activeItem.altText || props.businessName} className="h-full min-h-[320px] w-full object-cover sm:min-h-[460px]" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent p-5 text-white">
                  <div className="flex flex-wrap gap-2">
                    {activeItem.isCover ? <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">Cover</span> : null}
                    {activeItem.isFeatured ? <span className="rounded-full bg-amber-400/90 px-3 py-1 text-xs font-semibold text-slate-950">Featured photo</span> : null}
                    {!activeItem.isPublic ? <span className="rounded-full bg-slate-950/70 px-3 py-1 text-xs font-semibold">Hidden from public</span> : null}
                  </div>
                  {activeItem.caption ? <p className="mt-3 text-base font-medium">{activeItem.caption}</p> : null}
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid gap-3">
            {galleryItems.map((item, index) => (
              <article
                key={item.id}
                draggable={props.mode === "manage"}
                onDragStart={() => setDraggingId(item.id)}
                onDragOver={(event) => {
                  if (props.mode !== "manage") {
                    return;
                  }
                  event.preventDefault();
                }}
                onDrop={() => {
                  if (props.mode !== "manage" || !draggingId) {
                    return;
                  }
                  updateItems(moveEditableBusinessMediaItem(galleryItems, draggingId, item.id));
                  setDraggingId(null);
                }}
                className={`rounded-[1.5rem] border p-3 transition ${
                  activeId === item.id ? "border-cyan-600 bg-cyan-50/60" : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <button type="button" className="grid w-full gap-3 text-left" onClick={() => setActiveId(item.id)}>
                  <div className="flex gap-3">
                    <img src={item.url} alt={item.altText || props.businessName} className="h-24 w-24 rounded-2xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2">
                        {item.isCover ? <span className="rounded-full bg-cyan-100 px-2 py-1 text-[11px] font-semibold text-cyan-800">Cover</span> : null}
                        {item.isFeatured ? <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800">Featured</span> : null}
                        {!item.isPublic ? <span className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700">Private</span> : null}
                      </div>
                      <p className="mt-2 truncate text-sm font-semibold text-slate-950">
                        {item.caption || `Image ${index + 1}`}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">{item.fileName}</p>
                    </div>
                  </div>
                </button>

                {props.mode === "manage" ? (
                  <div className="mt-3 grid gap-3">
                    <label className="grid gap-1 text-xs font-medium text-slate-600">
                      Caption
                      <input
                        className="rounded-2xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                        value={item.caption}
                        onChange={(event) => updateItem(item.id, (current) => ({ ...current, caption: sanitizeText(event.target.value) }))}
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-medium text-slate-600">
                      Alt text
                      <input
                        className="rounded-2xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                        value={item.altText}
                        onChange={(event) => updateItem(item.id, (current) => ({ ...current, altText: sanitizeText(event.target.value) }))}
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-medium text-slate-600">
                      Purpose
                      <select
                        className="rounded-2xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                        value={item.mediaPurpose}
                        onChange={(event) => updateItem(item.id, (current) => ({ ...current, mediaPurpose: event.target.value as BusinessMediaItem["mediaPurpose"] }))}
                      >
                        <option value="gallery">Gallery photo</option>
                        <option value="menu">Menu page</option>
                        <option value="food">Food photo</option>
                        <option value="interior">Interior</option>
                        <option value="exterior">Exterior</option>
                        <option value="logo">Logo</option>
                        <option value="cover">Cover photo</option>
                      </select>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-900" onClick={() => setCover(item.id)}>
                        Set as cover
                      </button>
                      <button type="button" className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-900" onClick={() => setFeatured(item.id)}>
                        Set as featured
                      </button>
                      <button type="button" className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-900" onClick={() => togglePublic(item.id)}>
                        {item.isPublic ? "Hide from public" : "Show publicly"}
                      </button>
                      <button type="button" className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700" onClick={() => handleDelete(item.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      )}

      {notice ? <p className="mt-4 text-sm text-slate-600" role="status">{notice}</p> : null}
    </section>
  );
}
