import Badge from "@/components/ui/Badge";
import type { AdminContentSection, AdminContentStatus } from "@/data/adminContent";

type AdminContentManagerProps = {
  section: AdminContentSection;
};

function getStatusClass(status: AdminContentStatus) {
  if (status === "Published" || status === "Ready") {
    return "adminContentStatusHealthy";
  }

  if (status === "Needs review") {
    return "adminContentStatusReview";
  }

  if (status === "Archived") {
    return "adminContentStatusMuted";
  }

  return "adminContentStatusDraft";
}

export function AdminContentManager({ section }: AdminContentManagerProps) {
  return (
    <div className="adminContentManager">
      <section className="adminContentHero">
        <div>
          <Badge>{section.eyebrow}</Badge>
          <h1>{section.title}</h1>
          <p>{section.description}</p>
        </div>
        <a className="adminContentAddButton" href={`#add-${section.slug}`}>
          <span aria-hidden="true">+</span>
          {section.addLabel}
        </a>
      </section>

      <section className="adminPanel">
        <div className="adminContentToolbar">
          <label className="adminSearchField" htmlFor={`${section.slug}-search`}>
            <span>Search</span>
            <input id={`${section.slug}-search`} placeholder={section.searchPlaceholder} type="search" />
          </label>
          <div className="adminFilterGroup" aria-label={`${section.title} filters`}>
            {section.filters.map((filter) => (
              <button className={filter === "All" ? "adminFilterActive" : ""} key={filter} type="button">
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="adminContentList" aria-label={`${section.title} list`}>
          <div className="adminContentListHeader" aria-hidden="true">
            <span>Name</span>
            <span>Category</span>
            <span>Status</span>
            <span>Owner</span>
            <span>Updated</span>
            <span>Actions</span>
          </div>

          {section.items.map((item) => (
            <article className="adminContentRow" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <p>{item.detail}</p>
              </div>
              <span>{item.category}</span>
              <span className={`adminContentStatus ${getStatusClass(item.status)}`}>{item.status}</span>
              <span>{item.owner}</span>
              <time>{item.updated}</time>
              <div className="adminContentActions">
                <button type="button">Edit</button>
                <button type="button">Archive</button>
              </div>
            </article>
          ))}
        </div>

        <div className="adminEmptyState">
          <strong>No matching records</strong>
          <p>When search or filters return no results, this empty state will guide admins to clear filters or add content.</p>
        </div>
      </section>
    </div>
  );
}
