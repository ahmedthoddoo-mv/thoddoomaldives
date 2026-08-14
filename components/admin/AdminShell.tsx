import { logoutAdmin } from "@/app/admin/actions";

type AdminShellProps = {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  title?: string;
  subtitle?: string;
};

export function AdminShell({ children, sidebar, title, subtitle }: AdminShellProps) {
  return (
    <main className="adminShell">
      <div className="adminAppFrame">
        {sidebar ?? null}
        <div className="adminMainSurface">
          <form action={logoutAdmin} className="adminLogoutBar">
            <span>{title ?? "Secure owner session"}</span>
            {subtitle ? <small>{subtitle}</small> : null}
            <button type="submit">Log out</button>
          </form>
          {children}
        </div>
      </div>
    </main>
  );
}
