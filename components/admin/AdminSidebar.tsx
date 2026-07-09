type AdminSidebarItem = {
  label: string;
  href: string;
};

type AdminSidebarProps = {
  items: AdminSidebarItem[];
};

export function AdminSidebar({ items }: AdminSidebarProps) {
  return (
    <aside className="adminSidebar" aria-label="Admin navigation">
      <a className="adminBrandMark" href="/admin" aria-label="iThoddoo Maldives Admin home">
        <span>iT</span>
        <strong>Admin</strong>
      </a>
      <nav>
        {items.map((item) => (
          <a href={item.href} key={item.label}>
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
