import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Add Admin Property",
  robots: {
    index: false,
    follow: false
  }
};

export default function NewAdminPropertyPage() {
  redirect("/admin/businesses/new?type=guesthouse");
}
