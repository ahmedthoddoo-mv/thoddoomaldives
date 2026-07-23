"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveAdminPropertyToSupabase } from "@/app/admin/properties/actions";
import { PropertyPublishPanel } from "@/components/admin/PropertyPublishPanel";
import { PropertySaveStatus } from "@/components/admin/PropertySaveStatus";
import Badge from "@/components/ui/Badge";
import type { AdminManagedProperty } from "@/data/adminContent";
import { createPropertySlug, normalizePropertySlug } from "@/lib/properties/propertySlug";
import { validatePropertyForSave } from "@/lib/properties/propertyValidation";

type AdminPropertyFormProps = {
  mode: "new" | "edit";
  property?: AdminManagedProperty;
  propertyId?: string;
};

type PropertyFormState = {
  name: string;
  slug: string;
  island: string;
  address: string;
  whatsapp: string;
  email: string;
  website: string;
  googleMaps: string;
  googleMapsLink: string;
  gpsLocation: string;
  shortDescription: string;
  fullDescription: string;
  amenities: string;
  roomTypes: string;
  gallery: string;
  coverImage: string;
  policies: string;
  checkIn: string;
  checkOut: string;
  membershipPlan: AdminManagedProperty["membershipPlan"];
  verificationStatus: AdminManagedProperty["verificationStatus"];
  isPublished: boolean;
  isFeatured: boolean;
  seoTitle: string;
  seoDescription: string;
};

const emptyPropertyState: PropertyFormState = {
  name: "",
  slug: "",
  island: "Thoddoo",
  address: "",
  whatsapp: "",
  email: "",
  website: "",
  googleMaps: "",
  googleMapsLink: "",
  gpsLocation: "",
  shortDescription: "",
  fullDescription: "",
  amenities: "Breakfast\nWi-Fi\nAirport transfer support",
  roomTypes: "Deluxe Double | From $85/night | 2 guests",
  gallery: "/images/hero-thoddoo.jpg\n/images/homepage/hero-1.jpg",
  coverImage: "/images/hero-thoddoo.jpg",
  policies: "Free cancellation until 7 days before arrival\nPassport details required at check-in",
  checkIn: "14:00",
  checkOut: "12:00",
  membershipPlan: "Free",
  verificationStatus: "Draft",
  isPublished: false,
  isFeatured: false,
  seoTitle: "",
  seoDescription: ""
};

function stateFromProperty(property?: AdminManagedProperty): PropertyFormState {
  if (!property) {
    return emptyPropertyState;
  }

  return {
    name: property.name,
    slug: property.slug,
    island: property.island,
    address: property.address,
    whatsapp: property.whatsapp,
    email: property.email,
    website: property.website,
    googleMaps: property.googleMaps,
    googleMapsLink: property.googleMapsLink,
    gpsLocation: property.gpsLocation,
    shortDescription: property.shortDescription,
    fullDescription: property.fullDescription,
    amenities: property.amenities.join("\n"),
    roomTypes: property.roomTypes.map((room) => `${room.name} | ${room.price} | ${room.capacity}`).join("\n"),
    gallery: property.gallery.join("\n"),
    coverImage: property.coverImage,
    policies: property.policies.join("\n"),
    checkIn: property.checkIn,
    checkOut: property.checkOut,
    membershipPlan: property.membershipPlan,
    verificationStatus: property.verificationStatus,
    isPublished: property.isPublished,
    isFeatured: property.isFeatured,
    seoTitle: property.seo.title,
    seoDescription: property.seo.description
  };
}

function listFromText(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatSlug(value: string) {
  return normalizePropertySlug(value);
}

function createPropertyId(slug: string, existingProperties: AdminManagedProperty[], currentId?: string) {
  const baseId = `property-${slug}`;
  if (currentId) {
    return currentId;
  }

  if (!existingProperties.some((property) => property.id === baseId)) {
    return baseId;
  }

  return `${baseId}-${Date.now()}`;
}

function createPropertyFromState({
  form,
  existingProperties,
  currentProperty
}: {
  form: PropertyFormState;
  existingProperties: AdminManagedProperty[];
  currentProperty?: AdminManagedProperty;
}): AdminManagedProperty {
  const gallery = listFromText(form.gallery);
  const roomTypes = listFromText(form.roomTypes).map((line) => {
    const [name = "Room type", price = "Price pending", capacity = "Capacity pending"] = line.split("|").map((part) => part.trim());
    return { name, price, capacity };
  });
  const slug = createPropertySlug(form.slug || form.name);
  const name = form.name.trim();
  const heroImage = form.coverImage.trim() || gallery[0] || "/images/hero-thoddoo.jpg";

  return {
    id: createPropertyId(slug, existingProperties, currentProperty?.id),
    name,
    slug,
    island: form.island.trim(),
    address: form.address.trim(),
    logo: currentProperty?.logo || name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "IT",
    coverImage: heroImage,
    gallery: gallery.length > 0 ? gallery : [heroImage],
    description: form.shortDescription.trim(),
    shortDescription: form.shortDescription.trim(),
    fullDescription: form.fullDescription.trim() || form.shortDescription.trim(),
    roomTypes,
    amenities: listFromText(form.amenities),
    policies: listFromText(form.policies),
    checkIn: form.checkIn.trim(),
    checkOut: form.checkOut.trim(),
    whatsapp: form.whatsapp.trim(),
    email: form.email.trim(),
    website: form.website.trim(),
    googleMaps: form.googleMaps.trim(),
    googleMapsLink: form.googleMapsLink.trim(),
    gpsLocation: form.gpsLocation.trim(),
    membershipPlan: form.membershipPlan,
    verificationStatus: form.verificationStatus,
    isPublished: form.isPublished,
    isFeatured: form.isFeatured,
    isArchived: currentProperty?.isArchived ?? false,
    seo: {
      title: form.seoTitle.trim() || `${name || "Property"} | iThoddoo Maldives`,
      description: form.seoDescription.trim() || form.shortDescription.trim(),
      slug
    },
    updated: "Just now"
  };
}

export function AdminPropertyForm({ mode, property }: AdminPropertyFormProps) {
  const router = useRouter();
  const [isSaving, startSavingTransition] = useTransition();
  const allProperties = property ? [property] : [];
  const activeProperty = property;
  const [form, setForm] = useState<PropertyFormState>(() => stateFromProperty(activeProperty));
  const [notice, setNotice] = useState("Ready to save property changes.");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const preview = useMemo(() => {
    const gallery = listFromText(form.gallery);
    const roomTypes = listFromText(form.roomTypes).map((line) => {
      const [name = "Room type", price = "Price pending", capacity = "Capacity pending"] = line.split("|").map((part) => part.trim());
      return { name, price, capacity };
    });

    return {
      gallery,
      roomTypes,
      amenities: listFromText(form.amenities),
      policies: listFromText(form.policies),
      heroImage: form.coverImage || gallery[0] || "/images/hero-thoddoo.jpg",
      slug: form.slug || formatSlug(form.name) || "new-property"
    };
  }, [form]);

  function updateField<Field extends keyof PropertyFormState>(field: Field, value: PropertyFormState[Field]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateName(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: current.slug ? current.slug : formatSlug(value),
      seoTitle: current.seoTitle ? current.seoTitle : `${value} | iThoddoo Maldives`
    }));
  }

  function saveWithStatus({
    status,
    publish,
    verify
  }: {
    status: AdminManagedProperty["verificationStatus"];
    publish: boolean;
    verify?: boolean;
  }) {
    const nextForm = {
      ...form,
      slug: createPropertySlug(form.slug || form.name),
      verificationStatus: verify ? "Verified" : status,
      isPublished: publish
    };
    const nextProperty = createPropertyFromState({
      form: nextForm,
      existingProperties: allProperties,
      currentProperty: activeProperty
    });
    const activeSlug = activeProperty ? normalizePropertySlug(activeProperty.slug) : "";
    const validationProperties =
      mode === "edit" && activeSlug
        ? allProperties.filter((existingProperty) => normalizePropertySlug(existingProperty.slug) !== activeSlug)
        : allProperties;
    const validation = validatePropertyForSave({
      property: nextProperty,
      existingProperties: validationProperties
    });

    setForm(nextForm);
    setValidationErrors(validation.errors);

    if (!validation.valid) {
      setNotice("Property could not be saved. Please fix the highlighted requirements.");
      return;
    }

    setNotice(`Saving ${nextProperty.name} to the live business database...`);
    setValidationErrors([]);

    startSavingTransition(async () => {
      const result = await saveAdminPropertyToSupabase({ property: nextProperty, publish });

      if (!result.ok) {
        setNotice(`Nothing was saved: ${result.message}`);
        return;
      }

      setNotice(result.message);

      if (mode === "new") {
        router.push(`/admin/properties/${result.propertyId ?? nextProperty.id}/edit`);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="adminPropertyEditor">
      <section className="adminContentHero">
        <div>
          <Badge>{mode === "new" ? "New property" : "Edit property"}</Badge>
          <h1>{mode === "new" ? "Add Property" : `Edit ${property?.name ?? "Property"}`}</h1>
          <p>
            Manage listing content, media paths, room prices, contact channels, publication state, partner status, and SEO
            fields without touching code. Records are saved only to the live business database.
          </p>
        </div>
        <Link className="adminContentAddButton adminContentSecondaryButton" href="/admin/properties">
          Back to properties
        </Link>
      </section>

      <PropertySaveStatus message={notice} errors={validationErrors} />

      <div className="adminPropertyEditorGrid">
        <form className="adminPropertyForm" onSubmit={(event) => event.preventDefault()}>
          <section>
            <h2>Business Info</h2>
            <div className="adminFormGrid">
              <label>
                <span>Property name</span>
                <input value={form.name} onChange={(event) => updateName(event.target.value)} placeholder="Thoddoo Sun Sky Inn" />
              </label>
              <label>
                <span>Slug</span>
                <input value={form.slug} onChange={(event) => updateField("slug", formatSlug(event.target.value))} placeholder="thoddoo-sun-sky-inn" />
              </label>
              <label>
                <span>Island</span>
                <input value={form.island} onChange={(event) => updateField("island", event.target.value)} placeholder="Thoddoo" />
              </label>
              <label>
                <span>Address</span>
                <input value={form.address} onChange={(event) => updateField("address", event.target.value)} placeholder="Central Thoddoo, Maldives" />
              </label>
            </div>
          </section>

          <section>
            <h2>Contact & Location</h2>
            <div className="adminFormGrid">
              <label>
                <span>WhatsApp</span>
                <input value={form.whatsapp} onChange={(event) => updateField("whatsapp", event.target.value)} placeholder="+960 700 0000" />
              </label>
              <label>
                <span>Email</span>
                <input value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="hello@property.example" />
              </label>
              <label>
                <span>Website</span>
                <input value={form.website} onChange={(event) => updateField("website", event.target.value)} placeholder="https://property.example" />
              </label>
              <label>
                <span>GPS Location</span>
                <input value={form.gpsLocation} onChange={(event) => updateField("gpsLocation", event.target.value)} placeholder="4.4376, 72.9596" />
              </label>
              <label>
                <span>Google Maps label</span>
                <input value={form.googleMaps} onChange={(event) => updateField("googleMaps", event.target.value)} placeholder="Central Thoddoo" />
              </label>
              <label>
                <span>Google Maps link</span>
                <input value={form.googleMapsLink} onChange={(event) => updateField("googleMapsLink", event.target.value)} placeholder="https://maps.google.com/..." />
              </label>
            </div>
          </section>

          <section>
            <h2>Listing Content</h2>
            <div className="adminFormGrid">
              <label className="adminFormWide">
                <span>Short description</span>
                <textarea value={form.shortDescription} onChange={(event) => updateField("shortDescription", event.target.value)} rows={3} />
              </label>
              <label className="adminFormWide">
                <span>Full description</span>
                <textarea value={form.fullDescription} onChange={(event) => updateField("fullDescription", event.target.value)} rows={6} />
              </label>
              <label>
                <span>Check-in</span>
                <input value={form.checkIn} onChange={(event) => updateField("checkIn", event.target.value)} />
              </label>
              <label>
                <span>Check-out</span>
                <input value={form.checkOut} onChange={(event) => updateField("checkOut", event.target.value)} />
              </label>
            </div>
          </section>

          <section>
            <h2>Inventory & Media</h2>
            <div className="adminFormGrid">
              <label className="adminFormWide">
                <span>Amenities, one per line</span>
                <textarea value={form.amenities} onChange={(event) => updateField("amenities", event.target.value)} rows={5} />
              </label>
              <label className="adminFormWide">
                <span>Room types, one per line: name | price | capacity</span>
                <textarea value={form.roomTypes} onChange={(event) => updateField("roomTypes", event.target.value)} rows={5} />
              </label>
              <label className="adminFormWide">
                <span>Gallery image paths, one per line</span>
                <textarea value={form.gallery} onChange={(event) => updateField("gallery", event.target.value)} rows={5} />
              </label>
              <label className="adminFormWide">
                <span>Hero image path</span>
                <input value={form.coverImage} onChange={(event) => updateField("coverImage", event.target.value)} placeholder="/images/hero-thoddoo.jpg" />
              </label>
              <label className="adminFormWide">
                <span>Policies, one per line</span>
                <textarea value={form.policies} onChange={(event) => updateField("policies", event.target.value)} rows={4} />
              </label>
            </div>
          </section>

          <section>
            <h2>Membership & SEO</h2>
            <div className="adminFormGrid">
              <label>
                <span>Membership plan</span>
                <select value={form.membershipPlan} onChange={(event) => updateField("membershipPlan", event.target.value as PropertyFormState["membershipPlan"])}>
                  <option>Free</option>
                  <option>Verified</option>
                  <option>Premium</option>
                </select>
              </label>
              <label>
                <span>Verification status</span>
                <select value={form.verificationStatus} onChange={(event) => updateField("verificationStatus", event.target.value as PropertyFormState["verificationStatus"])}>
                  <option>Draft</option>
                  <option>Pending</option>
                  <option>Verified</option>
                  <option>Suspended</option>
                </select>
              </label>
              <label className="adminFormWide">
                <span>SEO title</span>
                <input value={form.seoTitle} onChange={(event) => updateField("seoTitle", event.target.value)} />
              </label>
              <label className="adminFormWide">
                <span>SEO description</span>
                <textarea value={form.seoDescription} onChange={(event) => updateField("seoDescription", event.target.value)} rows={3} />
              </label>
            </div>
          </section>

          <PropertyPublishPanel
            isFeatured={form.isFeatured}
            isPublished={form.isPublished}
            isSaving={isSaving}
            onArchive={() => {
              const nextProperty = createPropertyFromState({ form, existingProperties: allProperties, currentProperty: activeProperty });
              setNotice(`Archiving ${nextProperty.name || "property"}...`);
              startSavingTransition(async () => {
                const result = await saveAdminPropertyToSupabase({
                  property: { ...nextProperty, isArchived: true, isPublished: false }
                });
                setNotice(result.message);
                if (result.ok) {
                  router.push("/admin/properties");
                }
              });
            }}
            onPublish={() => saveWithStatus({ status: "Verified", publish: true, verify: true })}
            onSaveDraft={() => saveWithStatus({ status: "Draft", publish: false })}
            onSubmitForReview={() => saveWithStatus({ status: "Pending", publish: false })}
            onToggleFeatured={() => updateField("isFeatured", !form.isFeatured)}
            onVerify={() => updateField("verificationStatus", "Verified")}
            slug={preview.slug}
            verificationStatus={form.verificationStatus}
          />
        </form>

        <aside className="adminPropertyEditorPreview" aria-label="Property preview">
          <Badge>Preview</Badge>
          <div className="adminPropertyPreviewImage" style={{ backgroundImage: `url('${preview.heroImage}')` }} />
          <h2>{form.name || "New property name"}</h2>
          <p>{form.shortDescription || "Short listing description will appear here."}</p>
          <div className="adminPropertyPreviewMeta">
            <span>{form.membershipPlan}</span>
            <span>{form.verificationStatus}</span>
            <span>{form.isPublished ? "Published" : "Unpublished"}</span>
            {form.isFeatured ? <span>Featured</span> : null}
          </div>
          <div className="adminPropertyRooms">
            <h3>Rooms</h3>
            {preview.roomTypes.map((room) => (
              <div key={`${room.name}-${room.price}`}>
                <span>{room.name}</span>
                <strong>{room.price}</strong>
                <small>{room.capacity}</small>
              </div>
            ))}
          </div>
          <div className="adminPropertyAmenities">
            {preview.amenities.map((amenity) => (
              <span key={amenity}>{amenity}</span>
            ))}
          </div>
          <div className="adminPropertySeo">
            <h3>SEO preview</h3>
            <p>
              <strong>{form.seoTitle || `${form.name || "Property"} | iThoddoo Maldives`}</strong>
              <span>{form.seoDescription || form.shortDescription || "SEO description preview."}</span>
              <small>/stay/{preview.slug}</small>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
