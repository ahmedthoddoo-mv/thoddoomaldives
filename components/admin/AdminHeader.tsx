import Badge from "@/components/ui/Badge";

export function AdminHeader() {
  return (
    <header className="adminHeader">
      <div>
        <Badge>Demo mode</Badge>
        <p className="eyebrow">iThoddoo Maldives Admin</p>
        <h1>Business Control Center</h1>
        <p>
          Monitor partner applications, operating health, content readiness, and roadmap momentum from one internal
          command view.
        </p>
      </div>
      <aside className="adminNotice" aria-label="Dashboard environment">
        <span>UI only</span>
        <strong>No backend connected</strong>
        <p>No login, database, API, payments, or authentication are active in this demo.</p>
      </aside>
    </header>
  );
}
