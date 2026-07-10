"use client";

import { useMemo, useState } from "react";
import Badge from "@/components/ui/Badge";
import { AdminImagePicker } from "@/components/admin/AdminImagePicker";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import {
  getEmptyAdminCmsRecord,
  mediaAssets,
  type AdminCmsField,
  type AdminCmsRecord,
  type AdminCmsSectionConfig
} from "@/data/adminCms";

type AdminCmsFormProps = {
  mode: "new" | "edit";
  section: AdminCmsSectionConfig;
  record?: AdminCmsRecord;
};

type CmsFormState = Record<string, string | boolean | string[]>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function fieldValueToString(value: string | boolean | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.join("\n");
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return value ?? "";
}

function initialState(section: AdminCmsSectionConfig, record?: AdminCmsRecord): CmsFormState {
  if (!record) {
    return getEmptyAdminCmsRecord(section.slug);
  }

  return Object.entries(record).reduce<CmsFormState>((accumulator, [key, value]) => {
    if (typeof value === "string" || typeof value === "boolean") {
      accumulator[key] = value;
    } else if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
      accumulator[key] = value;
    } else {
      accumulator[key] = JSON.stringify(value, null, 2);
    }

    return accumulator;
  }, {});
}

function listFromText(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function AdminFormField({
  field,
  value,
  onChange
}: {
  field: AdminCmsField;
  value: string | boolean | string[] | undefined;
  onChange: (value: string | boolean | string[]) => void;
}) {
  const className = field.wide ? "adminFormWide" : "";

  if (field.type === "boolean") {
    return (
      <label className={`adminCmsBoolean ${className}`}>
        <input checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
        <span>{field.label}</span>
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label className={className}>
        <span>{field.label}</span>
        <select value={fieldValueToString(value)} onChange={(event) => onChange(event.target.value)}>
          {(field.options ?? []).map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "textarea" || field.type === "multiline") {
    return (
      <label className={className}>
        <span>{field.label}</span>
        <textarea
          onChange={(event) => onChange(field.type === "multiline" ? listFromText(event.target.value) : event.target.value)}
          placeholder={field.placeholder}
          rows={field.rows ?? 4}
          value={fieldValueToString(value)}
        />
      </label>
    );
  }

  return (
    <label className={className}>
      <span>{field.label}</span>
      <input
        onChange={(event) => onChange(field.name === "slug" ? slugify(event.target.value) : event.target.value)}
        placeholder={field.placeholder}
        type={field.type === "email" || field.type === "url" ? field.type : "text"}
        value={fieldValueToString(value)}
      />
    </label>
  );
}

export function AdminCmsForm({ mode, section, record }: AdminCmsFormProps) {
  const [form, setForm] = useState<CmsFormState>(() => initialState(section, record));
  const [notice, setNotice] = useState("Demo form ready. Changes stay in local state until a backend is connected.");

  const preview = useMemo(
    () => ({
      title: String(form.title || form.propertyName || form.restaurantName || form.experienceName || form.companyName || "Untitled content"),
      slug: String(form.slug || "new-content"),
      summary: String(form.summary || form.shortDescription || form.description || "Preview summary will appear here."),
      heroImage: String(form.heroImage || "/images/hero-thoddoo.jpg"),
      publicationStatus: String(form.publicationStatus || "Draft"),
      verificationStatus: String(form.verificationStatus || "Unverified"),
      category: String(form.category || section.title)
    }),
    [form, section.title]
  );

  function updateField(name: string, value: string | boolean | string[]) {
    setForm((current) => {
      const next = { ...current, [name]: value };

      if (name === "title" && !current.slug && typeof value === "string") {
        next.slug = slugify(value);
      }

      return next;
    });
  }

  function demoSave(label: string) {
    setNotice(`${label} saved in local demo state. Wire this to a future database mutation.`);
  }

  return (
    <div className="adminPropertyEditor">
      <section className="adminContentHero">
        <div>
          <Badge>{mode === "new" ? "Create content" : "Edit content"}</Badge>
          <h1>
            {mode === "new" ? section.addLabel : `Edit ${record?.title ?? section.title}`}
          </h1>
          <p>{section.description}</p>
        </div>
        <a className="adminContentAddButton adminContentSecondaryButton" href={`/admin/${section.slug}`}>
          Back to {section.slug}
        </a>
      </section>

      <section className="adminPanel adminPropertyEditorNotice">
        <strong>{notice}</strong>
        <span>No backend, database, API, login, upload, or payment logic is used in this demo CMS.</span>
      </section>

      <div className="adminPropertyEditorGrid">
        <form className="adminPropertyForm" onSubmit={(event) => event.preventDefault()}>
          <section>
            <h2>Core Content</h2>
            <div className="adminFormGrid">
              {section.fields.map((field) => (
                <AdminFormField
                  field={field}
                  key={field.name}
                  onChange={(value) => updateField(field.name, value)}
                  value={form[field.name]}
                />
              ))}
            </div>
          </section>

          {section.slug === "guesthouses" ? (
            <section>
              <h2>Room Editor</h2>
              <div className="adminCmsRoomEditor">
                <strong>Demo room block</strong>
                <p>
                  Room name, bed type, capacity, adults, children, price, breakfast, description, room amenities, images,
                  and active/inactive state are represented in the mock data model. A repeatable room builder can connect
                  here when persistence exists.
                </p>
              </div>
            </section>
          ) : null}

          <section>
            <h2>Media Picker</h2>
            <AdminImagePicker
              assets={mediaAssets}
              onSelectPath={(path) => updateField("heroImage", path)}
              selectedPaths={Array.isArray(form.gallery) ? form.gallery : [String(form.heroImage || "")]}
            />
          </section>

          <div className="adminPropertyEditorActions">
            <button onClick={() => demoSave(mode === "new" ? "New content draft" : "Content edits")} type="button">
              {mode === "new" ? "Create demo item" : "Save demo edits"}
            </button>
            <button
              onClick={() => updateField("publicationStatus", form.publicationStatus === "Published" ? "Draft" : "Published")}
              type="button"
            >
              {form.publicationStatus === "Published" ? "Unpublish" : "Publish"}
            </button>
            <button onClick={() => updateField("verificationStatus", "Verified")} type="button">
              Mark verified
            </button>
            <button onClick={() => updateField("isFeatured", !form.isFeatured)} type="button">
              {form.isFeatured ? "Remove featured" : "Mark featured"}
            </button>
            <button onClick={() => demoSave("Archive/delete demo action")} type="button">
              Archive/delete demo
            </button>
          </div>
        </form>

        <aside className="adminPropertyEditorPreview" aria-label="CMS preview">
          <Badge>Preview card</Badge>
          <div className="adminPropertyPreviewImage" style={{ backgroundImage: `url('${preview.heroImage}')` }} />
          <h2>{preview.title}</h2>
          <p>{preview.summary}</p>
          <div className="adminPropertyPreviewMeta">
            <AdminStatusBadge status={preview.publicationStatus as "Draft" | "Published" | "Archived"} />
            <AdminStatusBadge status={preview.verificationStatus as "Unverified" | "Pending" | "Verified"} />
            <AdminStatusBadge status={form.isFeatured ? "Featured" : "Standard"} />
          </div>
          <div className="adminPropertySeo">
            <h3>SEO preview</h3>
            <p>
              <strong>{String(form.seoTitle || `${preview.title} | iThoddoo Maldives`)}</strong>
              <span>{String(form.seoDescription || preview.summary)}</span>
              <small>/{section.slug}/{preview.slug}</small>
            </p>
          </div>
          <div className="adminCmsRoomEditor">
            <strong>Future database mapping</strong>
            <p>Submit this form to create/update rows, sync media asset references, and regenerate public page metadata.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
