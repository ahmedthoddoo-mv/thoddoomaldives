import { revalidatePath } from "next/cache";

export const publicListingPaths = [
  "/",
  "/stay",
  "/transfer",
  "/experiences",
  "/excursions",
  "/restaurants",
  "/sitemap.xml"
] as const;

export function revalidatePublicListingPaths() {
  for (const path of publicListingPaths) revalidatePath(path);
  revalidatePath("/stay/[slug]", "page");
}
