import type { MetadataRoute } from "next";
import { PropertyRepository } from "@/lib/repositories";
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

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const guesthouses = PropertyRepository.findPublicAll();

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
