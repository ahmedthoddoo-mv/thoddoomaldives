import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";
import { getPublishedStayProperties } from "@/lib/properties/propertyReads";
import { SITE_URL } from "@/lib/seo";

const staticRoutes = [
  { path: "/", priority: 1 },
  { path: "/stay", priority: 0.9 },
  { path: "/excursions", priority: 0.85 },
  { path: "/experiences", priority: 0.85 },
  { path: "/restaurants", priority: 0.75 },
  { path: "/transfer", priority: 0.8 },
  { path: "/guide", priority: 0.75 },
  { path: "/gallery", priority: 0.6 },
  { path: "/contact", priority: 0.85 },
  { path: "/about", priority: 0.65 },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const guesthouseRead = await getPublishedStayProperties();
  const guesthouses = guesthouseRead.data;

  return [
    ...staticRoutes.map((route) => ({
      url: new URL(route.path, SITE_URL).toString(),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: route.priority,
    })),
    ...guesthouses.map((guesthouse) => ({
      url: new URL(`/stay/${guesthouse.slug}`, SITE_URL).toString(),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
