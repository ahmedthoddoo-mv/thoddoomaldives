type AdminQuickAction = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

type AdminQuickActionsProps = {
  actions: AdminQuickAction[];
};

export function AdminQuickActions({ actions }: AdminQuickActionsProps) {
  return (
    <section className="adminPanel" id="actions">
      <div className="adminSectionHeader">
        <p className="eyebrow">Quick actions</p>
        <h2>Common admin tasks</h2>
      </div>
      <div className="adminActionGrid">
        {actions.map((action) => (
          <a
            className={`adminActionButton ${action.variant === "primary" ? "adminActionPrimary" : ""}`}
            href={action.href}
            key={action.label}
          >
            <span aria-hidden="true">+</span>
            {action.label}
          </a>
        ))}
      </div>
    </section>
  );
}
