type RecentApplication = {
  business: string;
  type: string;
  plan: string;
  status: string;
  date: string;
};

type AdminRecentApplicationsProps = {
  applications: RecentApplication[];
};

export function AdminRecentApplications({ applications }: AdminRecentApplicationsProps) {
  return (
    <section className="adminPanel" id="applications">
      <div className="adminSectionHeader">
        <p className="eyebrow">Recent applications</p>
        <h2>Partner pipeline</h2>
      </div>
      <div className="adminApplicationList">
        <div className="adminApplicationHeader" aria-hidden="true">
          <span>Business</span>
          <span>Type</span>
          <span>Plan</span>
          <span>Status</span>
          <span>Date</span>
        </div>
        {applications.map((application) => (
          <article className="adminApplicationRow" key={`${application.business}-${application.date}`}>
            <strong>{application.business}</strong>
            <span>{application.type}</span>
            <span>{application.plan}</span>
            <span className="adminStatusPill">{application.status}</span>
            <time>{application.date}</time>
          </article>
        ))}
      </div>
    </section>
  );
}
