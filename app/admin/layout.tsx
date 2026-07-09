import { AdminDemoGate } from "@/components/admin/AdminDemoGate";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminDemoGate>{children}</AdminDemoGate>;
}
