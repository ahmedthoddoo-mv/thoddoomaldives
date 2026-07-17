import type { Metadata } from "next";
import { AdminDemoGate } from "@/components/admin/AdminDemoGate";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminLoginPage() {
  return <AdminDemoGate />;
}
