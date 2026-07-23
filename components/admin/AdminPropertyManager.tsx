"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
  const items = properties;
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

  return (
    <div className="adminPropertyManager">
      <section className="adminContentHero">
        <div>
          <Badge>Business directory</Badge>
          <h1>Businesses</h1>
          <p>
            Add verified businesses one by one, review their details, and control exactly what is published.
            This dashboard shows live database records only.
          </p>
        </div>
        <Link className="adminContentAddButton" href="/admin/properties/new">
          <span aria-hidden="true">+</span>
          Add Real Business
        </Link>
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
                <Link className="adminPropertyActionPrimary" href="/admin/properties/new" key={action}>
                  {action}
                </Link>
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
                <a href={`/stay/${property.slug}?preview=admin`} target="_blank" rel="noopener noreferrer">
                  Open Preview
                </a>
              </div>
            </div>
          </article>
        ))}
      </section>

      {filteredProperties.length === 0 ? (
        <section className="adminEmptyState">
          <strong>No real businesses added yet</strong>
          <p>Use “Add Real Business” to create the first verified listing. Nothing will appear publicly until you approve and publish it.</p>
          <Link className="adminContentAddButton" href="/admin/properties/new">Add Real Business</Link>
        </section>
      ) : null}
    </div>
  );
}
