type AdminShellProps = {
  children: React.ReactNode;
  sidebar: React.ReactNode;
};

export function AdminShell({ children, sidebar }: AdminShellProps) {
  return (
    <main className="adminShell">
      <div className="adminAppFrame">
        {sidebar}
        <div className="adminMainSurface">{children}</div>
      </div>
    </main>
  );
}
