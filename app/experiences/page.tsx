import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import ExcursionsPage from "@/app/excursions/page";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Thoddoo Experiences",
  description:
    "Explore Thoddoo snorkeling, sandbank trips, fishing, water sports, dolphin cruises, and local island experiences.",
  path: "/experiences",
  image: "/images/homepage/hero-4.jpg",
});

export default function ExperiencesPage() {
  return <ExcursionsPage />;
}
