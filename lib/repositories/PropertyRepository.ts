import { adminManagedProperties } from "@/data/adminContent";
import { guesthouses } from "@/data/guesthouses";
import { createRepository } from "@/lib/repositories/types";

export const PropertyRepository = {
  ...createRepository({
    records: adminManagedProperties,
    searchFields: ["name", "slug", "island", "address", "membershipPlan", "verificationStatus"]
  }),
  findPublicAll() {
    return guesthouses;
  },
  findPublicBySlug(slug: string) {
    return guesthouses.find((guesthouse) => guesthouse.slug === slug);
  },
  findPublished() {
    return adminManagedProperties.filter((property) => property.isPublished);
  },
  findFeatured() {
    return adminManagedProperties.filter((property) => property.isFeatured);
  },
  findVerified() {
    return adminManagedProperties.filter((property) => property.verificationStatus === "Verified");
  }
};
