import { logoutAdminDemo } from "@/app/admin/actions";

type AdminShellProps = {
  children: React.ReactNode;
  sidebar: React.ReactNode;
};

export function AdminShell({ children, sidebar }: AdminShellProps) {
  return (
    <main className="adminShell">
      <div className="adminAppFrame">
        {sidebar}
        <div className="adminMainSurface">
          <form action={logoutAdminDemo} className="adminLogoutBar">
            <span>Admin demo session</span>
            <button type="submit">Log out</button>
          </form>
          {children}
        </div>
      </div>
    </main>
  );
}
