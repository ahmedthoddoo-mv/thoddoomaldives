import { redirect } from "next/navigation";

export default function NewGuesthousePage() {
  redirect("/admin/properties/new");
}
