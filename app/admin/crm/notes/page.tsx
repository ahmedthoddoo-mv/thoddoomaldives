import type { Metadata } from "next";
import { AdminCrmNotes } from "@/components/admin/AdminCrmNotes";
import { AdminCrmShell } from "@/components/admin/AdminCrmShell";

export const metadata: Metadata = {
  title: "Admin CRM Notes",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminCrmNotesPage() {
  return (
    <AdminCrmShell>
      <AdminCrmNotes />
    </AdminCrmShell>
  );
}
