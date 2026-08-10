import assert from "node:assert/strict";
import test from "node:test";
import { adminPropertyToGuesthouse } from "../lib/properties/propertyDomain.ts";
import type { BusinessMediaItem } from "../types/business-media.ts";

function mediaItem(overrides: Partial<BusinessMediaItem>): BusinessMediaItem {
  return {
    id: overrides.id ?? "media-1",
    businessType: "property",
    businessId: overrides.businessId ?? "property-1",
    mediaAssetId: overrides.mediaAssetId ?? `asset-${overrides.id ?? "1"}`,
    url: overrides.url ?? `https://example.com/${overrides.id ?? "1"}.webp`,
    fileName: overrides.fileName ?? `${overrides.id ?? "1"}.webp`,
    mimeType: "image/webp",
    width: 1200,
    height: 900,
    storageBucket: "business-media",
    storagePath: overrides.storagePath ?? `${overrides.id ?? "1"}.webp`,
    caption: overrides.caption ?? "",
    altText: overrides.altText ?? "Property",
    sortOrder: overrides.sortOrder ?? 0,
    isCover: overrides.isCover ?? false,
    isFeatured: overrides.isFeatured ?? false,
    isPublic: overrides.isPublic ?? true,
    mediaPurpose: overrides.mediaPurpose ?? "gallery",
    source: overrides.source ?? "storage"
  };
}

test("property mapper prefers canonical public business media cover over legacy cover", () => {
  const property = {
    id: "prop-1",
    slug: "sunset-villa",
    name: "Sunset Villa",
    shortDescription: "A premium villa",
    fullDescription: "A premium villa on Thoddoo",
    description: "A premium villa on Thoddoo",
    island: "Thoddoo",
    address: "North Thoddoo",
    whatsapp: "+960 777 1234",
    email: "stay@example.com",
    website: "https://example.com",
    checkIn: "14:00",
    checkOut: "11:00",
    googleMaps: "",
    googleMapsLink: "",
    verificationStatus: "Verified",
    membershipPlan: "Premium",
    coverImage: "https://legacy.example.com/legacy-cover.webp",
    gallery: ["https://legacy.example.com/legacy-1.webp"],
    media: [
      mediaItem({ id: "legacy-cover", url: "https://legacy.example.com/legacy-cover.webp", sortOrder: 0 }),
      mediaItem({ id: "cover", url: "https://cdn.example.com/cover.webp", sortOrder: 1, isCover: true }),
      mediaItem({ id: "gallery", url: "https://cdn.example.com/gallery.webp", sortOrder: 2 })
    ],
    roomTypes: [],
    amenities: [],
    facilities: [],
    policies: [],
    services: [],
    metadata: {}
  } as unknown as Parameters<typeof adminPropertyToGuesthouse>[0];

  const guesthouse = adminPropertyToGuesthouse(property);

  assert.equal(guesthouse.heroImage, "https://cdn.example.com/cover.webp");
  assert.deepEqual(guesthouse.gallery, [
    "https://legacy.example.com/legacy-cover.webp",
    "https://cdn.example.com/gallery.webp"
  ]);
  assert.ok(guesthouse.media?.some((item) => item.url === "https://cdn.example.com/cover.webp"));
});

test("property mapper falls back to featured media when no cover exists", () => {
  const property = {
    id: "prop-2",
    slug: "reef-retreat",
    name: "Reef Retreat",
    shortDescription: "A reef-side retreat",
    fullDescription: "A reef-side retreat",
    description: "A reef-side retreat",
    island: "Thoddoo",
    address: "South Thoddoo",
    whatsapp: "+960 777 5678",
    email: "retreat@example.com",
    website: "https://example.com",
    checkIn: "14:00",
    checkOut: "11:00",
    googleMaps: "",
    googleMapsLink: "",
    verificationStatus: "New",
    membershipPlan: "Verified",
    coverImage: "",
    gallery: [],
    media: [
      mediaItem({ id: "featured", url: "https://cdn.example.com/featured.webp", isFeatured: true, sortOrder: 1 }),
      mediaItem({ id: "gallery", url: "https://cdn.example.com/gallery.webp", sortOrder: 2 })
    ],
    roomTypes: [],
    amenities: [],
    facilities: [],
    policies: [],
    services: [],
    metadata: {}
  } as unknown as Parameters<typeof adminPropertyToGuesthouse>[0];

  const guesthouse = adminPropertyToGuesthouse(property);

  assert.equal(guesthouse.heroImage, "https://cdn.example.com/featured.webp");
  assert.deepEqual(guesthouse.gallery, ["https://cdn.example.com/gallery.webp"]);
});
