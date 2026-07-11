import Badge from "@/components/ui/Badge";
import { AdminCrmPartners } from "@/components/admin/AdminCrmPartners";
import { AdminCrmStatusBadge } from "@/components/admin/AdminCrmStatusBadge";
import { CRMRepository } from "@/lib/repositories";

export function AdminCrmOverview() {
  const crmSummaryStats = CRMRepository.findSummaryStats();
  const crmTasks = CRMRepository.findTasks();

  return (
    <div className="adminCrmStack">
      <section className="adminContentHero">
        <div>
          <Badge>Internal CRM</Badge>
          <h1>Project Atlas CRM</h1>
          <p>Internal partner pipeline for follow-ups, verification, onboarding readiness, and membership growth.</p>
        </div>
        <a className="adminContentAddButton" href="/admin/crm/partners">
          Open Partners
        </a>
      </section>

      <section className="adminStatsGrid" aria-label="CRM summary">
        {crmSummaryStats.map((stat) => (
          <article className="adminStatCard" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <p>{stat.detail}</p>
          </article>
        ))}
      </section>

      <section className="adminPanel">
        <div className="adminSectionHeader">
          <p className="eyebrow">Task pulse</p>
          <h2>Active CRM Tasks</h2>
        </div>
        <div className="adminCrmTaskStrip">
          {crmTasks.slice(0, 4).map((task) => (
            <article key={task.id}>
              <strong>{task.type}</strong>
              <p>{task.partnerBusiness}</p>
              <AdminCrmStatusBadge label={task.status} />
            </article>
          ))}
        </div>
      </section>

      <AdminCrmPartners />
    </div>
  );
}
