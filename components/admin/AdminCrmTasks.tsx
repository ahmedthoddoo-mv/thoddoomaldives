"use client";

import { useMemo, useState } from "react";
import Badge from "@/components/ui/Badge";
import { AdminCrmStatusBadge } from "@/components/admin/AdminCrmStatusBadge";
import type { CrmTaskStatus } from "@/data/adminCrm";
import { CRMRepository } from "@/lib/repositories";

const taskColumns: CrmTaskStatus[] = ["Open", "In Progress", "Waiting Response", "Completed"];

export function AdminCrmTasks() {
  const crmTasks = CRMRepository.findTasks();
  const [query, setQuery] = useState("");

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return crmTasks;
    }

    return crmTasks.filter((task) =>
      [task.title, task.partnerBusiness, task.type, task.owner, task.status, task.priority].join(" ").toLowerCase().includes(normalizedQuery)
    );
  }, [query]);

  return (
    <div className="adminCrmStack">
      <section className="adminContentHero">
        <div>
          <Badge>Tasks</Badge>
          <h1>CRM Task Management</h1>
          <p>Track calls, missing media, logo requests, pricing follow-ups, waiting responses, verification, and completed work.</p>
        </div>
        <a className="adminContentAddButton" href="/admin/crm/notes">
          View Notes
        </a>
      </section>

      <section className="adminPanel">
        <label className="adminSearchField" htmlFor="crm-task-search">
          <span>Search tasks</span>
          <input id="crm-task-search" onChange={(event) => setQuery(event.target.value)} placeholder="Search task, partner, owner..." value={query} />
        </label>
      </section>

      <section className="adminCrmTaskBoard" aria-label="CRM task board">
        {taskColumns.map((column) => (
          <div className="adminCrmTaskColumn" key={column}>
            <h2>{column}</h2>
            {filteredTasks
              .filter((task) => task.status === column)
              .map((task) => (
                <article key={task.id}>
                  <div>
                    <strong>{task.title}</strong>
                    <p>{task.partnerBusiness}</p>
                  </div>
                  <div className="adminCrmBadgeStack">
                    <AdminCrmStatusBadge label={task.type} />
                    <AdminCrmStatusBadge label={task.priority} />
                  </div>
                  <small>
                    {task.owner} | {task.dueDate}
                  </small>
                </article>
              ))}
          </div>
        ))}
      </section>
    </div>
  );
}
