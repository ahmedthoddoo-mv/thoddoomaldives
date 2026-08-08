"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveAdminBusinessListing, type AdminBusinessKind } from "@/app/admin/business-actions";
import MediaGallery from "@/components/media/MediaGallery";
import type { BusinessMediaItem } from "@/types/business-media";

type Values = Record<string, string | boolean | string[] | number>;

type FieldDefinition = { key: string; label: string; wide?: boolean; type?: "text" | "textarea" | "checkbox" };

const fields: Record<AdminBusinessKind, FieldDefinition[]> = {
  transfer: [
    { key: "title", label: "Service title" }, { key: "transferType", label: "Transfer type" },
    { key: "departurePoint", label: "Departure" }, { key: "arrivalPoint", label: "Arrival" },
    { key: "schedule", label: "Schedule", wide: true }, { key: "duration", label: "Duration" },
    { key: "price", label: "Structured display price" }, { key: "description", label: "Description", wide: true }
  ],
  experience: [
    { key: "title", label: "Title" }, { key: "category", label: "Category" }, { key: "duration", label: "Duration" },
    { key: "price", label: "Structured display price" }, { key: "description", label: "Description", wide: true },
    { key: "highlights", label: "Highlights (one per line)", wide: true }
  ],
  restaurant: [
    { key: "title", label: "Name" }, { key: "cuisine", label: "Cuisine types (one per line)" },
    { key: "openingHours", label: "Opening hours" }, { key: "price", label: "Price range" },
    { key: "location", label: "Location / Area" }, { key: "address", label: "Full address" },
    { key: "phone", label: "Phone" }, { key: "whatsapp", label: "WhatsApp (leave blank if unconfirmed)" },
    { key: "email", label: "Email" }, { key: "website", label: "Website" },
    { key: "instagram", label: "Instagram handle" }, { key: "facebook", label: "Facebook page" },
    { key: "latitude", label: "Latitude" }, { key: "longitude", label: "Longitude" },
    { key: "description", label: "Description", wide: true },
    { key: "interactiveMenu", label: "Interactive menu JSON", wide: true },
    { key: "showOriginalMenu", label: "Show original menu to guests", type: "checkbox" },
    { key: "promotionTitle", label: "Promotion title" },
    { key: "promotionDescription", label: "Promotion description", wide: true },
    { key: "promotionMediaUrl", label: "Promotion media URL" },
    { key: "promotionCtaLabel", label: "Promotion CTA label" },
    { key: "promotionCtaDestination", label: "Promotion CTA destination" },
    { key: "promotionActive", label: "Promotion active", type: "checkbox" },
    { key: "promotionStartDate", label: "Promotion start date" },
    { key: "promotionEndDate", label: "Promotion end date" },
    { key: "promotionSortOrder", label: "Promotion sort order" }
  ]
};

function galleryUrls(items: BusinessMediaItem[]) {
  return items
    .filter((item) => item.isPublic)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((item) => item.url);
}

export function AdminBusinessEditor({
  kind,
  id,
  initialValues,
  initialMedia = []
}: {
  kind: AdminBusinessKind;
  id?: string;
  initialValues?: Values;
  initialMedia?: BusinessMediaItem[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState<Values>({ publicationStatus: "draft", verificationStatus: "pending", featured: false, image: "", showOriginalMenu: false, promotionActive: false, promotionSortOrder: 0, ...initialValues });
  const [media, setMedia] = useState<BusinessMediaItem[]>(initialMedia);
  const [message, setMessage] = useState("");
  function text(key: string) { const value = values[key]; return Array.isArray(value) ? value.join("\n") : String(value ?? ""); }
  function update(key: string, value: string | boolean | number) { setValues((current) => ({ ...current, [key]: value })); }
  function save() { startTransition(async () => { const result = await saveAdminBusinessListing({ kind, id, values }); setMessage(result.message); if (result.ok) { router.push(`/admin/${kind === "experience" ? "experiences" : `${kind}s`}`); router.refresh(); } }); }
  function syncMedia(nextMedia: BusinessMediaItem[]) {
    setMedia(nextMedia);
    const cover = nextMedia.find((item) => item.isCover)?.url ?? galleryUrls(nextMedia)[0] ?? "";
    setValues((current) => ({ ...current, image: cover }));
  }
  return (
    <section className="adminPanel">
      <div className="adminSectionHeader"><p className="eyebrow">Live database editor</p><h1>{id ? "Edit" : "Add"} {kind}</h1></div>
      <div className="adminFormGrid">
        {fields[kind].map((field) => {
          if (field.type === "checkbox") {
            return (
              <label key={field.key}>
                <span>{field.label}</span>
                <input checked={Boolean(values[field.key])} type="checkbox" onChange={(event) => update(field.key, event.target.checked)} />
              </label>
            );
          }
          return (
            <label className={field.wide ? "adminFormWide" : ""} key={field.key}>
              <span>{field.label}</span>
              {field.wide || field.type === "textarea"
                ? <textarea rows={4} value={text(field.key)} onChange={(event) => update(field.key, event.target.value)} />
                : <input value={text(field.key)} onChange={(event) => update(field.key, event.target.value)} />}
            </label>
          );
        })}
        <label className="adminFormWide"><span>Cover image path</span><input value={text("image")} readOnly /></label>
        <label><span>Publication</span><select value={text("publicationStatus")} onChange={(event) => update("publicationStatus", event.target.value)}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
        <label><span>Verification</span><select value={text("verificationStatus")} onChange={(event) => update("verificationStatus", event.target.value)}><option value="pending">Pending</option><option value="verified">Verified</option><option value="suspended">Suspended</option></select></label>
        <label><span><input checked={Boolean(values.featured)} type="checkbox" onChange={(event) => update("featured", event.target.checked)} /> Featured</span></label>
      </div>
      <div className="mt-8">
        <MediaGallery
          mode="manage"
          businessId={id}
          businessName={text("title") || "Business"}
          businessType={kind}
          items={media}
          onItemsChange={syncMedia}
          title="Business media"
          description="Use the shared business media system for uploads, WebP optimization, cover selection, ordering, captions, and public gallery control."
        />
      </div>
      <div className="adminContentActions"><button disabled={pending} type="button" onClick={save}>{pending ? "Saving…" : "Save listing"}</button></div>
      {message ? <p role="status">{message}</p> : null}
    </section>
  );
}
