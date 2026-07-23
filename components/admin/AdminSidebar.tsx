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
      <Link className="adminBrandMark" href="/admin" aria-label="iThoddoo Maldives Admin home">
        <span>iT</span>
        <strong>Admin</strong>
      </Link>
      <nav>
        {items.map((item) => (
          <Link href={item.href} key={item.label}>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
import Link from "next/link";
