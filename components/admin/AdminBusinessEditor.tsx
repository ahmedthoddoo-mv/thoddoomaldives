"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveAdminBusinessListing, type AdminBusinessKind } from "@/app/admin/business-actions";

type Values = Record<string, string | boolean | string[]>;

const fields: Record<AdminBusinessKind, Array<{ key: string; label: string; wide?: boolean }>> = {
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
    { key: "title", label: "Name" }, { key: "cuisine", label: "Cuisine (one per line)" },
    { key: "openingHours", label: "Opening hours" }, { key: "price", label: "Price range" },
    { key: "location", label: "Location" }, { key: "description", label: "Description", wide: true }
  ]
};

export function AdminBusinessEditor({ kind, id, initialValues }: { kind: AdminBusinessKind; id?: string; initialValues?: Values }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState<Values>({ publicationStatus: "draft", verificationStatus: "pending", featured: false, image: "", ...initialValues });
  const [message, setMessage] = useState("");
  function text(key: string) { const value = values[key]; return Array.isArray(value) ? value.join("\n") : String(value ?? ""); }
  function update(key: string, value: string | boolean) { setValues((current) => ({ ...current, [key]: value })); }
  function save() { startTransition(async () => { const result = await saveAdminBusinessListing({ kind, id, values }); setMessage(result.message); if (result.ok) { router.push(`/admin/${kind === "experience" ? "experiences" : `${kind}s`}`); router.refresh(); } }); }
  return (
    <section className="adminPanel">
      <div className="adminSectionHeader"><p className="eyebrow">Live database editor</p><h1>{id ? "Edit" : "Add"} {kind}</h1></div>
      <div className="adminFormGrid">
        {fields[kind].map((field) => <label className={field.wide ? "adminFormWide" : ""} key={field.key}><span>{field.label}</span>{field.wide ? <textarea rows={4} value={text(field.key)} onChange={(event) => update(field.key, event.target.value)} /> : <input value={text(field.key)} onChange={(event) => update(field.key, event.target.value)} />}</label>)}
        <label><span>Image path</span><input value={text("image")} onChange={(event) => update("image", event.target.value)} /></label>
        <label><span>Publication</span><select value={text("publicationStatus")} onChange={(event) => update("publicationStatus", event.target.value)}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
        <label><span>Verification</span><select value={text("verificationStatus")} onChange={(event) => update("verificationStatus", event.target.value)}><option value="pending">Pending</option><option value="verified">Verified</option><option value="suspended">Suspended</option></select></label>
        <label><span><input checked={Boolean(values.featured)} type="checkbox" onChange={(event) => update("featured", event.target.checked)} /> Featured</span></label>
      </div>
      <div className="adminContentActions"><button disabled={pending} type="button" onClick={save}>{pending ? "Saving…" : "Save listing"}</button></div>
      {message ? <p role="status">{message}</p> : null}
    </section>
  );
}
