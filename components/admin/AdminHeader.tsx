import Badge from "@/components/ui/Badge";

export function AdminHeader() {
  return (
    <header className="adminHeader">
      <div>
        <Badge>Owner portal</Badge>
        <p className="eyebrow">iThoddoo Maldives Admin</p>
        <h1>Business Control Center</h1>
        <p>
          Monitor partner applications, operating health, content readiness, and roadmap momentum from one internal
          command view.
        </p>
      </div>
      <aside className="adminNotice" aria-label="Dashboard environment">
        <span>Secure access</span>
        <strong>Owner session active</strong>
        <p>Secure owner authentication and live database access are active.</p>
      </aside>
    </header>
  );
}
