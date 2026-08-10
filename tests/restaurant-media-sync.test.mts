import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  getCanonicalPublicMediaCover,
  getCanonicalPublicMediaGallery
} from "../lib/business-media/public.ts";
import { formatRestaurantCuisine } from "../lib/restaurant-menu/format.ts";
import type { BusinessMediaItem } from "../types/business-media.ts";

const restaurantDetailSource = readFileSync(new URL("../app/restaurants/[slug]/page.tsx", import.meta.url), "utf8");
const mediaGallerySource = readFileSync(new URL("../components/media/MediaGallery.tsx", import.meta.url), "utf8");
const businessMediaServerSource = readFileSync(new URL("../lib/business-media/server.ts", import.meta.url), "utf8");
const mappersSource = readFileSync(new URL("../lib/supabase/mappers.ts", import.meta.url), "utf8");

function mediaItem(overrides: Partial<BusinessMediaItem>): BusinessMediaItem {
  return {
    id: overrides.id ?? "media-1",
    businessType: "restaurant",
    businessId: overrides.businessId ?? "restaurant-1",
    mediaAssetId: overrides.mediaAssetId ?? `asset-${overrides.id ?? "1"}`,
    url: overrides.url ?? `https://example.com/${overrides.id ?? "1"}.webp`,
    fileName: overrides.fileName ?? `${overrides.id ?? "1"}.webp`,
    mimeType: "image/webp",
    width: 1200,
    height: 900,
    storageBucket: "business-media",
    storagePath: overrides.storagePath ?? `${overrides.id ?? "1"}.webp`,
    caption: overrides.caption ?? "",
    altText: overrides.altText ?? "Food Land",
    sortOrder: overrides.sortOrder ?? 0,
    isCover: overrides.isCover ?? false,
    isFeatured: overrides.isFeatured ?? false,
    isPublic: overrides.isPublic ?? true,
    mediaPurpose: overrides.mediaPurpose ?? "gallery",
    source: overrides.source ?? "storage"
  };
}

test("restaurant mapper uses business_media cover before legacy image_path", () => {
  assert.match(mappersSource, /const coverItem = getCanonicalPublicMediaCover\(media\);/);
  assert.match(mappersSource, /const image = coverItem\?\.url \?\? \(restaurant\.image_path as string \| undefined\) \?\? gallery\[0\] \?\? "";/);
  assert.match(mappersSource, /const galleryMedia = getCanonicalPublicMediaGallery\(media\);/);
});

test("featured media is the fallback when no cover exists", () => {
  const cover = getCanonicalPublicMediaCover([
    mediaItem({ id: "gallery", url: "https://example.com/gallery.webp", sortOrder: 0 }),
    mediaItem({ id: "featured", url: "https://example.com/featured.webp", isFeatured: true, sortOrder: 3 })
  ]);

  assert.equal(cover?.url, "https://example.com/featured.webp");
});

test("first public media is the fallback when no cover or featured exists", () => {
  const cover = getCanonicalPublicMediaCover([
    mediaItem({ id: "second", url: "https://example.com/second.webp", sortOrder: 2 }),
    mediaItem({ id: "first", url: "https://example.com/first.webp", sortOrder: 1 }),
    mediaItem({ id: "private", url: "https://example.com/private.webp", sortOrder: 0, isPublic: false })
  ]);

  assert.equal(cover?.url, "https://example.com/first.webp");
});

test("legacy image_path is used only when no public business media exists", () => {
  const cover = getCanonicalPublicMediaCover([
    mediaItem({ id: "private", isPublic: false, url: "https://example.com/private.webp" })
  ]);

  assert.equal(cover, null);
  assert.match(mappersSource, /\n\s+: restaurant\.image_path/);
});

test("public gallery excludes the canonical cover and preserves ordered metadata items", () => {
  const gallery = getCanonicalPublicMediaGallery([
    mediaItem({ id: "cover", url: "https://example.com/cover.webp", isCover: true, sortOrder: 5, caption: "Cover" }),
    mediaItem({ id: "featured", url: "https://example.com/featured.webp", isFeatured: true, sortOrder: 1, caption: "Featured" }),
    mediaItem({ id: "gallery", url: "https://example.com/gallery.webp", sortOrder: 2, caption: "Gallery" })
  ]);

  assert.deepEqual(gallery.map((item) => item.url), [
    "https://example.com/featured.webp",
    "https://example.com/gallery.webp"
  ]);
  assert.deepEqual(gallery.map((item) => item.caption), ["Featured", "Gallery"]);
});

test("restaurant detail page uses canonical gallery helpers for the public gallery", () => {
  assert.match(restaurantDetailSource, /getCanonicalPublicMediaGallery/);
  assert.match(restaurantDetailSource, /galleryHref="#gallery"/);
  assert.match(restaurantDetailSource, /publicGalleryItems\.length > 0 \?/);
});

test("restaurant cuisine renders as a readable joined label", () => {
  assert.equal(formatRestaurantCuisine(["European", "Asian", "Maldivian"]), "European · Asian · Maldivian");
  assert.equal(formatRestaurantCuisine(["European"]), "European");
});

test("restaurant media saves revalidate the public detail route", () => {
  assert.match(businessMediaServerSource, /revalidatePath\(`\/restaurants\/\$\{context\.slug\}`\)/);
});

test("managed media edits no longer clear dirty state on every parent sync", () => {
  assert.match(mediaGallerySource, /function getItemsSignature/);
  assert.match(mediaGallerySource, /gallerySignatureRef\.current === propSignature/);
  assert.match(mediaGallerySource, /areItemsEqual\(galleryItemsRef\.current, props\.items\)/);
});
