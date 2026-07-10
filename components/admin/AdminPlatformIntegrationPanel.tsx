import { platformAdminFeed, platformLinkedProperties } from "@/data/platformIntegration";

function FeedColumn({
  title,
  items
}: {
  title: string;
  items: Array<{
    title: string;
    detail: string;
    meta: string;
  }>;
}) {
  return (
    <article className="adminPlatformFeedColumn">
      <h3>{title}</h3>
      <div>
        {items.map((item) => (
          <section key={`${title}-${item.title}-${item.meta}`}>
            <strong>{item.title}</strong>
            <p>{item.detail}</p>
            <small>{item.meta}</small>
          </section>
        ))}
      </div>
    </article>
  );
}

export function AdminPlatformIntegrationPanel() {
  const linkedProperty = platformLinkedProperties[0];

  return (
    <section className="adminPanel adminPlatformIntegration">
      <div className="adminSectionHeader">
        <p className="eyebrow">Platform integration</p>
        <h2>Connected Operations View</h2>
      </div>

      {linkedProperty ? (
        <div className="adminPlatformRelationshipCard">
          <div>
            <strong>{linkedProperty.property?.name ?? linkedProperty.relationship.propertyName}</strong>
            <p>
              {"Property -> Booking Engine -> CRM -> Partner Portal -> Media Library are linked through mock relationship IDs for future database migration."}
            </p>
          </div>
          <div className="adminPlatformRelationshipStats">
            <span>{linkedProperty.rooms.length} rooms</span>
            <span>{linkedProperty.bookings.length} bookings</span>
            <span>{linkedProperty.media.length} media assets</span>
            <span>{linkedProperty.analytics.length} analytics metrics</span>
          </div>
        </div>
      ) : null}

      <div className="adminPlatformFeedGrid">
        <FeedColumn title="Latest bookings" items={platformAdminFeed.latestBookings} />
        <FeedColumn title="Latest partners" items={platformAdminFeed.latestPartners} />
        <FeedColumn title="Latest uploads" items={platformAdminFeed.latestUploads} />
        <FeedColumn title="Tasks" items={platformAdminFeed.tasks} />
        <FeedColumn title="Pending approvals" items={platformAdminFeed.pendingApprovals} />
      </div>
    </section>
  );
}
