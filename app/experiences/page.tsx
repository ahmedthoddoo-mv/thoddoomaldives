import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Thoddoo Experiences",
  description:
    "Explore Thoddoo snorkeling, sandbank trips, fishing, water sports, dolphin cruises, and local island experiences.",
  path: "/experiences",
  image: "/images/homepage/hero-4.jpg",
});

export default function ExperiencesPage() {
  redirect("/excursions");
}
