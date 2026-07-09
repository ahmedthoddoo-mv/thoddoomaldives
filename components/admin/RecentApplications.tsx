type RecentApplication = {
  business: string;
  type: string;
  plan: string;
  status: string;
  date: string;
};

type RecentApplicationsProps = {
  applications: RecentApplication[];
};

export function RecentApplications({ applications }: RecentApplicationsProps) {
  return (
    <section className="adminPanel">
      <div className="adminSectionHeader">
        <p className="eyebrow">Recent applications</p>
        <h2>Partner pipeline</h2>
      </div>
      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th>Business</th>
              <th>Type</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={`${application.business}-${application.date}`}>
                <td>{application.business}</td>
                <td>{application.type}</td>
                <td>{application.plan}</td>
                <td>
                  <span className="adminStatusPill">{application.status}</span>
                </td>
                <td>{application.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
