"use client";

import { useMemo, useState } from "react";
import Badge from "@/components/ui/Badge";
import type { AdminManagedProperty, AdminPropertyAction } from "@/data/adminContent";
import { platformLinkedProperties } from "@/data/platformIntegration";

type AdminPropertyManagerProps = {
  actions: AdminPropertyAction[];
  properties: AdminManagedProperty[];
};

type PropertyFilter = "All" | "Published" | "Unpublished" | "Verified" | "Featured" | "Pending" | "Suspended" | "Archived";

const propertyFilters: PropertyFilter[] = [
  "All",
  "Published",
  "Unpublished",
  "Verified",
  "Featured",
  "Pending",
  "Suspended",
  "Archived"
];

function getVerificationClass(status: AdminManagedProperty["verificationStatus"]) {
  if (status === "Verified") {
    return "adminContentStatusHealthy";
  }

  if (status === "Suspended") {
    return "adminContentStatusReview";
  }

  if (status === "Pending") {
    return "adminContentStatusDraft";
  }

  return "adminContentStatusMuted";
}

function matchesFilter(property: AdminManagedProperty, filter: PropertyFilter) {
  if (filter === "All") {
    return true;
  }

  if (filter === "Published") {
    return property.isPublished && !property.isArchived;
  }

  if (filter === "Unpublished") {
    return !property.isPublished && !property.isArchived;
  }

  if (filter === "Featured") {
    return property.isFeatured;
  }

  if (filter === "Archived") {
    return property.isArchived;
  }

  return property.verificationStatus === filter;
}

function searchableText(property: AdminManagedProperty) {
  return [
    property.name,
    property.slug,
    property.island,
    property.address,
    property.description,
    property.shortDescription,
    property.fullDescription,
    property.membershipPlan,
    property.verificationStatus,
    property.whatsapp,
    property.email,
    property.website,
    property.googleMaps,
    property.gpsLocation,
    property.seo.title,
    property.seo.description,
    property.seo.slug,
    ...property.amenities,
    ...property.policies,
    ...property.roomTypes.flatMap((room) => [room.name, room.price, room.capacity])
  ]
    .join(" ")
    .toLowerCase();
}

export function AdminPropertyManager({ actions, properties }: AdminPropertyManagerProps) {
  const [items, setItems] = useState(properties);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<PropertyFilter>("All");
  const [previewPropertyId, setPreviewPropertyId] = useState(properties[0]?.id ?? "");

  const filteredProperties = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((property) => {
      const passesFilter = matchesFilter(property, activeFilter);
      const passesSearch = normalizedQuery.length === 0 || searchableText(property).includes(normalizedQuery);

      return passesFilter && passesSearch;
    });
  }, [activeFilter, items, query]);

  const previewProperty = items.find((property) => property.id === previewPropertyId) ?? filteredProperties[0] ?? items[0];

  function updateProperty(id: string, updater: (property: AdminManagedProperty) => AdminManagedProperty) {
    setItems((current) => current.map((property) => (property.id === id ? updater(property) : property)));
  }

  function handlePublishToggle(id: string) {
    updateProperty(id, (property) => ({ ...property, isPublished: !property.isPublished, updated: "Just now" }));
  }

  function handleVerify(id: string) {
    updateProperty(id, (property) => ({ ...property, verificationStatus: "Verified", updated: "Just now" }));
  }

  function handleFeatureToggle(id: string) {
    updateProperty(id, (property) => ({ ...property, isFeatured: !property.isFeatured, updated: "Just now" }));
  }

  function handleSuspend(id: string) {
    updateProperty(id, (property) => ({
      ...property,
      verificationStatus: property.verificationStatus === "Suspended" ? "Pending" : "Suspended",
      isPublished: false,
      updated: "Just now"
    }));
  }

  function handleArchive(id: string) {
    updateProperty(id, (property) => ({ ...property, isArchived: !property.isArchived, isPublished: false, updated: "Just now" }));
  }

  return (
    <div className="adminPropertyManager">
      <section className="adminContentHero">
        <div>
          <Badge>Property CMS</Badge>
          <h1>Partner Property Management</h1>
          <p>
            Add, edit, preview, publish, verify, feature, suspend, and archive demo property records from a
            database-ready admin model. Changes are local-state only until a backend is connected.
          </p>
        </div>
        <a className="adminContentAddButton" href="/admin/properties/new">
          <span aria-hidden="true">+</span>
          Add Property
        </a>
      </section>

      <section className="adminPanel">
        <div className="adminContentToolbar">
          <label className="adminSearchField" htmlFor="property-search">
            <span>Search</span>
            <input
              id="property-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search properties, rooms, contacts, SEO slugs..."
              type="search"
              value={query}
            />
          </label>
          <div className="adminFilterGroup" aria-label="Property filters">
            {propertyFilters.map((filter) => (
              <button
                className={filter === activeFilter ? "adminFilterActive" : ""}
                key={filter}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="adminPropertyActionGrid" aria-label="Property management actions">
          {actions.map((action) => {
            if (action === "Add Property") {
              return (
                <a className="adminPropertyActionPrimary" href="/admin/properties/new" key={action}>
                  {action}
                </a>
              );
            }

            return (
              <button key={action} type="button">
                {action}
              </button>
            );
          })}
        </div>
      </section>

      {previewProperty ? (
        <section className="adminPanel adminPropertyPreviewPanel" aria-label="Property preview">
          <div>
            <Badge>Live preview</Badge>
            <h2>{previewProperty.name}</h2>
            <p>{previewProperty.shortDescription}</p>
          </div>
          <article className="adminPropertyPreviewCard">
            <div style={{ backgroundImage: `url('${previewProperty.coverImage}')` }} aria-label={`${previewProperty.name} hero image`} />
            <div>
              <span className={`adminContentStatus ${getVerificationClass(previewProperty.verificationStatus)}`}>
                {previewProperty.verificationStatus}
              </span>
              <h3>{previewProperty.name}</h3>
              <p>{previewProperty.seo.description}</p>
              <small>
                /stay/{previewProperty.slug} · {previewProperty.membershipPlan} ·{" "}
                {previewProperty.isPublished ? "Published" : "Unpublished"}
              </small>
            </div>
          </article>
        </section>
      ) : null}

      <section className="adminPropertyGrid" aria-label="Managed properties">
        {filteredProperties.map((property) => (
          <article className={`adminPropertyCard ${property.isArchived ? "adminPropertyArchived" : ""}`} key={property.id}>
            <div
              className="adminPropertyCover"
              style={{ backgroundImage: `url('${property.coverImage}')` }}
              aria-label={`${property.name} cover image`}
            >
              <span className="adminPropertyLogo">{property.logo}</span>
              <div className="adminPropertyCoverBadges">
                {property.isPublished ? <span>Published</span> : <span>Unpublished</span>}
                {property.isFeatured ? <span>Featured</span> : null}
                {property.isArchived ? <span>Archived</span> : null}
              </div>
            </div>

            <div className="adminPropertyBody">
              <div className="adminPropertyTitleRow">
                <div>
                  <p className="eyebrow">{property.membershipPlan} Partner</p>
                  <h2>{property.name}</h2>
                  <small>{property.address}</small>
                </div>
                <span className={`adminContentStatus ${getVerificationClass(property.verificationStatus)}`}>
                  {property.verificationStatus}
                </span>
              </div>

              <p>{property.shortDescription}</p>

              <div className="adminPropertyMediaStrip">
                {property.gallery.map((image) => (
                  <span key={image} style={{ backgroundImage: `url('${image}')` }} aria-label={`${property.name} gallery item`} />
                ))}
              </div>

              <div className="adminPropertyDetailGrid">
                {(() => {
                  const linkedProperty = platformLinkedProperties.find((item) => item.relationship.propertyId === property.id);

                  return linkedProperty ? (
                    <>
                      <div>
                        <span>Partner</span>
                        <strong>{linkedProperty.crmPartner?.business ?? property.name}</strong>
                      </div>
                      <div>
                        <span>Bookings</span>
                        <strong>{linkedProperty.bookings.length} linked</strong>
                      </div>
                      <div>
                        <span>Media</span>
                        <strong>{linkedProperty.media.length} assets</strong>
                      </div>
                      <div>
                        <span>Analytics</span>
                        <strong>{linkedProperty.analytics.length} metrics</strong>
                      </div>
                    </>
                  ) : null;
                })()}
                <div>
                  <span>Check-in</span>
                  <strong>{property.checkIn}</strong>
                </div>
                <div>
                  <span>Check-out</span>
                  <strong>{property.checkOut}</strong>
                </div>
                <div>
                  <span>GPS</span>
                  <strong>{property.gpsLocation}</strong>
                </div>
                <div>
                  <span>Maps</span>
                  <strong>{property.googleMaps}</strong>
                </div>
              </div>

              <div className="adminPropertyRooms">
                <h3>Room types & prices</h3>
                {property.roomTypes.map((room) => (
                  <div key={room.name}>
                    <span>{room.name}</span>
                    <strong>{room.price}</strong>
                    <small>{room.capacity}</small>
                  </div>
                ))}
              </div>

              <div className="adminPropertyAmenities">
                {property.amenities.map((amenity) => (
                  <span key={amenity}>{amenity}</span>
                ))}
              </div>

              <div className="adminPropertyContactGrid">
                <span>WhatsApp: {property.whatsapp}</span>
                <span>Email: {property.email}</span>
                <span>Website: {property.website}</span>
                <span>Google Maps: {property.googleMapsLink}</span>
              </div>

              <div className="adminPropertySeo">
                <h3>SEO fields</h3>
                <p>
                  <strong>{property.seo.title}</strong>
                  <span>{property.seo.description}</span>
                  <small>/{property.seo.slug}</small>
                </p>
              </div>

              <div className="adminContentActions adminPropertyActions">
                <a href={`/admin/properties/${property.id}/edit`}>Edit</a>
                <button onClick={() => setPreviewPropertyId(property.id)} type="button">
                  Preview
                </button>
                <button onClick={() => handlePublishToggle(property.id)} type="button">
                  {property.isPublished ? "Unpublish" : "Publish"}
                </button>
                <button onClick={() => handleVerify(property.id)} type="button">
                  Verify
                </button>
                <button onClick={() => handleFeatureToggle(property.id)} type="button">
                  {property.isFeatured ? "Unfeature" : "Feature"}
                </button>
                <button onClick={() => handleSuspend(property.id)} type="button">
                  {property.verificationStatus === "Suspended" ? "Unsuspend" : "Suspend"}
                </button>
                <button onClick={() => handleArchive(property.id)} type="button">
                  {property.isArchived ? "Restore" : "Archive"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {filteredProperties.length === 0 ? (
        <section className="adminEmptyState">
          <strong>No properties found</strong>
          <p>Clear search or filters to return to the demo property inventory.</p>
        </section>
      ) : null}
    </div>
  );
}
