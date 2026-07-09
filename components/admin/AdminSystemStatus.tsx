type SystemStatus = {
  title: string;
  value: string;
  description: string;
};

type AdminSystemStatusProps = {
  statuses: SystemStatus[];
};

export function AdminSystemStatus({ statuses }: AdminSystemStatusProps) {
  return (
    <section className="adminPanel" id="status">
      <div className="adminSectionHeader">
        <p className="eyebrow">System status</p>
        <h2>Operational readiness</h2>
      </div>
      <div className="adminStatusGrid">
        {statuses.map((status) => (
          <article className="adminSystemCard" key={status.title}>
            <span>{status.title}</span>
            <strong>{status.value}</strong>
            <p>{status.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
