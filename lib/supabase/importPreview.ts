import "server-only";

import type { AdminManagedProperty } from "@/data/adminContent";
import { PropertyRepository } from "@/lib/repositories";

type PropertyInsertPreview = {
  id: string;
  name: string;
  slug: string;
  valid: boolean;
  errors: string[];
  duplicateSlug: boolean;
  roomCount: number;
  mediaCount: number;
  payload: {
    name: string;
    slug: string;
    island: string;
    address: string | null;
    whatsapp: string | null;
    email: string | null;
    website: string | null;
    short_description: string;
    full_description: string | null;
    hero_image_path: string;
    check_in_time: string | null;
    check_out_time: string | null;
    verification_status: string;
    publication_status: string;
    featured: boolean;
    seo_title: string | null;
    seo_description: string | null;
  };
};

function statusToDb(status: AdminManagedProperty["verificationStatus"]) {
  if (status === "Verified") return "verified";
  if (status === "Suspended") return "suspended";
  if (status === "Draft") return "draft";
  return "pending";
}

function validateProperty(property: AdminManagedProperty, duplicateSlug: boolean) {
  const errors: string[] = [];

  if (!property.name) errors.push("Missing property name.");
  if (!property.slug) errors.push("Missing slug.");
  if (duplicateSlug) errors.push("Duplicate slug.");
  if (!property.island) errors.push("Missing island.");
  if (!property.whatsapp && !property.email) errors.push("Missing WhatsApp or email.");
  if (!property.shortDescription) errors.push("Missing short description.");
  if (!property.coverImage) errors.push("Missing hero image path.");
  if (property.roomTypes.length === 0) errors.push("Missing room records.");
  if (!property.roomTypes.some((room) => /\d/.test(room.price))) errors.push("Missing room starting price.");

  return errors;
}

export function getPropertyImportPreview(): PropertyInsertPreview[] {
  const properties = PropertyRepository.findAll();
  const slugCounts = properties.reduce<Record<string, number>>((counts, property) => {
    counts[property.slug] = (counts[property.slug] ?? 0) + 1;
    return counts;
  }, {});

  return properties.map((property) => {
    const duplicateSlug = slugCounts[property.slug] > 1;
    const errors = validateProperty(property, duplicateSlug);

    return {
      id: property.id,
      name: property.name,
      slug: property.slug,
      valid: errors.length === 0,
      errors,
      duplicateSlug,
      roomCount: property.roomTypes.length,
      mediaCount: new Set([property.coverImage, ...property.gallery].filter(Boolean)).size,
      payload: {
        name: property.name,
        slug: property.slug,
        island: property.island,
        address: property.address || null,
        whatsapp: property.whatsapp || null,
        email: property.email || null,
        website: property.website || null,
        short_description: property.shortDescription,
        full_description: property.fullDescription || null,
        hero_image_path: property.coverImage,
        check_in_time: property.checkIn || null,
        check_out_time: property.checkOut || null,
        verification_status: statusToDb(property.verificationStatus),
        publication_status: property.isPublished ? "published" : property.isArchived ? "archived" : "draft",
        featured: property.isFeatured,
        seo_title: property.seo.title || null,
        seo_description: property.seo.description || null
      }
    };
  });
}
