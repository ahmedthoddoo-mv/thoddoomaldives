import assert from "node:assert/strict";
import test from "node:test";
import { buildBookingWhatsAppMessage } from "@/lib/booking";
import { buildWhatsAppUrl, normalizeWhatsAppTarget } from "@/lib/whatsapp";
import { deriveOwnerAssignmentState, getDirectBookingUrl, getGuesthouseBadgeState, getGuesthouseDisplayPrice, getGuesthouseHeroMedia } from "@/lib/properties/guesthouse";
import { adminPropertyToGuesthouse } from "@/lib/properties/propertyDomain";
import type { AdminManagedProperty } from "@/data/adminContent";
import { getCanonicalPublicMediaCover, getCanonicalPublicMediaGallery } from "@/lib/business-media/public";

test("canonical property cover prefers public cover and featured media", () => {
  const items = [
    { id: "1", isCover: false, isFeatured: true, isPublic: true, url: "https://cdn.example.com/featured.jpg", fileName: "featured.jpg", mimeType: "image/jpeg", width: null, height: null, storageBucket: null, storagePath: null, caption: "", altText: "", sortOrder: 2, businessType: "property", businessId: "1", mediaAssetId: "a", source: "legacy", mediaPurpose: "gallery" },
    { id: "2", isCover: true, isFeatured: false, isPublic: true, url: "https://cdn.example.com/cover.jpg", fileName: "cover.jpg", mimeType: "image/jpeg", width: null, height: null, storageBucket: null, storagePath: null, caption: "", altText: "", sortOrder: 1, businessType: "property", businessId: "1", mediaAssetId: "b", source: "legacy", mediaPurpose: "gallery" },
    { id: "3", isCover: false, isFeatured: false, isPublic: true, url: "https://cdn.example.com/gallery.jpg", fileName: "gallery.jpg", mimeType: "image/jpeg", width: null, height: null, storageBucket: null, storagePath: null, caption: "", altText: "", sortOrder: 3, businessType: "property", businessId: "1", mediaAssetId: "c", source: "legacy", mediaPurpose: "gallery" }
  ] as never[];
  const cover = getCanonicalPublicMediaCover(items as never[]);
  const gallery = getCanonicalPublicMediaGallery(items as never[]);
  assert.equal(cover?.url, "https://cdn.example.com/cover.jpg");
  assert.equal(gallery.length, 2);
  assert.equal(gallery[0].url, "https://cdn.example.com/featured.jpg");
});

test("room price null remains null in the public guesthouse projection", () => {
  const property = {
    id: "property-1",
    name: "Test Stay",
    slug: "test-stay",
    island: "Thoddoo",
    address: "Address",
    logo: "TS",
    coverImage: "/cover.jpg",
    gallery: ["/cover.jpg"],
    description: "Test",
    shortDescription: "Test",
    fullDescription: "Test",
    roomTypes: [{ name: "Deluxe", price: null as unknown as string, capacity: "2 guests", bedType: "King", description: "", amenities: [] }],
    amenities: [],
    policies: [],
    checkIn: "14:00",
    checkOut: "12:00",
    whatsapp: "+960 914 2538",
    email: "stay@example.com",
    website: "https://example.com",
    googleMaps: "",
    googleMapsLink: "",
    gpsLocation: "",
    membershipPlan: "Verified" as const,
    verificationStatus: "Verified" as const,
    isPublished: true,
    isFeatured: false,
    isArchived: false,
    seo: { title: "Test", description: "Test", slug: "test-stay" },
    updated: "now"
  } satisfies AdminManagedProperty;

  const guesthouse = adminPropertyToGuesthouse(property);
  assert.equal(guesthouse.rooms[0].nightlyRate, null);
  assert.equal(guesthouse.rooms[0].price, "Price on request");
});

test("booking WhatsApp message includes the room and stay details", () => {
  const message = buildBookingWhatsAppMessage({
    propertyName: "Test Stay",
    whatsapp: "+960 914 2538",
    roomType: "Ocean View",
    checkIn: "2026-08-01",
    checkOut: "2026-08-03",
    adults: 2,
    children: 1,
    roomRate: 120,
    specialRequests: "Late check-in",
    services: []
  });

  assert.match(message, /Booking inquiry for Test Stay/);
  assert.match(message, /Room type: Ocean View/);
  assert.match(message, /Special requests: Late check-in/);
});

test("WhatsApp fallback uses the concierge number when no property number exists", () => {
  const url = buildWhatsAppUrl("", "hello");
  assert.match(url, /wa\.me\/9609142538/);
  assert.equal(normalizeWhatsAppTarget(""), "9609142538");
});

test("direct booking URL only uses a stored URL", () => {
  const directUrl = getDirectBookingUrl({
    bookingLinks: { directBookingUrl: "https://stay.example.com/direct" },
    website: "https://example.com"
  });
  assert.equal(directUrl, "https://stay.example.com/direct");
});

test("guesthouse draft resume state is derived from owner assignment context", () => {
  const state = deriveOwnerAssignmentState({ ownerLinked: false, partnerActive: false, invitationPending: true });
  assert.equal(state.status, "pending");
  assert.match(state.label, /Invitation pending/);
});

test("public empty fields are suppressed when building the guesthouse hero media", () => {
  const hero = getGuesthouseHeroMedia({
    heroImage: "",
    gallery: ["", ""],
    media: []
  });
  assert.equal(hero.heroImage, "");
  assert.deepEqual(hero.gallery, []);
});

test("verified and premium badges are surfaced for the public guesthouse card", () => {
  const badges = getGuesthouseBadgeState({ verificationStatus: "Verified", membershipBadge: "Premium" });
  assert.equal(badges.verified, true);
  assert.equal(badges.premium, true);
});

test("guesthouse display prices render as request when missing", () => {
  assert.equal(getGuesthouseDisplayPrice(null), "Price on request");
  assert.equal(getGuesthouseDisplayPrice(""), "Price on request");
  assert.equal(getGuesthouseDisplayPrice("Price on request"), "Price on request");
});
