import Badge from "@/components/ui/Badge";
import type { AdminManagedProperty, AdminPropertyAction } from "@/data/adminContent";

type AdminPropertyManagerProps = {
  actions: AdminPropertyAction[];
  properties: AdminManagedProperty[];
};

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

export function AdminPropertyManager({ actions, properties }: AdminPropertyManagerProps) {
  return (
    <div className="adminPropertyManager">
      <section className="adminContentHero">
        <div>
          <Badge>Property management</Badge>
          <h1>Partner Property Management</h1>
          <p>
            Manage property profiles, media, room inventory, contact channels, map data, membership, verification,
            featured placement, suspension state, and SEO readiness from one future database-ready model.
          </p>
        </div>
        <a className="adminContentAddButton" href="#add-property">
          <span aria-hidden="true">+</span>
          Add Property
        </a>
      </section>

      <section className="adminPanel">
        <div className="adminContentToolbar">
          <label className="adminSearchField" htmlFor="property-search">
            <span>Search</span>
            <input id="property-search" placeholder="Search properties, rooms, contacts, SEO slugs..." type="search" />
          </label>
          <div className="adminFilterGroup" aria-label="Property filters">
            {["All", "Verified", "Pending", "Premium", "Featured", "Suspended"].map((filter) => (
              <button className={filter === "All" ? "adminFilterActive" : ""} key={filter} type="button">
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="adminPropertyActionGrid" aria-label="Property management actions">
          {actions.map((action) => (
            <button className={action === "Add Property" ? "adminPropertyActionPrimary" : ""} key={action} type="button">
              {action}
            </button>
          ))}
        </div>
      </section>

      <section className="adminPropertyGrid" aria-label="Managed properties">
        {properties.map((property) => (
          <article className="adminPropertyCard" key={property.id}>
            <div
              className="adminPropertyCover"
              style={{ backgroundImage: `url('${property.coverImage}')` }}
              aria-label={`${property.name} cover image`}
            >
              <span className="adminPropertyLogo">{property.logo}</span>
              {property.isFeatured ? <span className="adminPropertyFeatured">Featured</span> : null}
            </div>

            <div className="adminPropertyBody">
              <div className="adminPropertyTitleRow">
                <div>
                  <p className="eyebrow">{property.membershipPlan} Partner</p>
                  <h2>{property.name}</h2>
                </div>
                <span className={`adminContentStatus ${getVerificationClass(property.verificationStatus)}`}>
                  {property.verificationStatus}
                </span>
              </div>

              <p>{property.description}</p>

              <div className="adminPropertyMediaStrip">
                {property.gallery.map((image) => (
                  <span key={image} style={{ backgroundImage: `url('${image}')` }} aria-label={`${property.name} gallery item`} />
                ))}
              </div>

              <div className="adminPropertyDetailGrid">
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
                <button type="button">Edit</button>
                <button type="button">Verify</button>
                <button type="button">Feature</button>
                <button type="button">Suspend</button>
                <button type="button">Delete</button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="adminEmptyState">
        <strong>No properties found</strong>
        <p>Future search and filter state can show this empty state when no property records match the selected criteria.</p>
      </section>
    </div>
  );
}
