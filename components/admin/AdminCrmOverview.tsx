import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { AdminCrmPartners } from "@/components/admin/AdminCrmPartners";
import { AdminCrmStatusBadge } from "@/components/admin/AdminCrmStatusBadge";
import type { CrmNote, CrmPartner, CrmTask } from "@/data/adminCrm";

export function AdminCrmOverview({ partners, tasks, notes }: { partners: CrmPartner[]; tasks: CrmTask[]; notes: CrmNote[] }) {
  const openTasks = tasks.filter((task) => task.status !== "Completed");
  const crmSummaryStats = [
    { label: "CRM Partners", value: String(partners.length), detail: "Live partner records" },
    { label: "Verified", value: String(partners.filter((partner) => partner.verification === "Verified").length), detail: "Verified partners" },
    { label: "Open Tasks", value: String(openTasks.length), detail: "Tasks requiring action" },
    { label: "Recent Notes", value: String(notes.length), detail: "Stored CRM notes" }
  ];

  return (
    <div className="adminCrmStack">
      <section className="adminContentHero">
        <div>
          <Badge>Internal CRM</Badge>
          <h1>Project Atlas CRM</h1>
          <p>Internal partner pipeline for follow-ups, verification, onboarding readiness, and membership growth.</p>
        </div>
        <Link className="adminContentAddButton" href="/admin/crm/partners">
          Open Partners
        </Link>
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
          {openTasks.slice(0, 4).map((task) => (
            <article key={task.id}>
              <strong>{task.type}</strong>
              <p>{task.partnerBusiness}</p>
              <AdminCrmStatusBadge label={task.status} />
            </article>
          ))}
        </div>
      </section>
      {openTasks.length === 0 ? <section className="adminEmptyState"><strong>No CRM tasks due</strong></section> : null}
      <AdminCrmPartners partners={partners} />
    </div>
  );
}
